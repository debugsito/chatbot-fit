const { addKeyword } = require('@bot-whatsapp/bot');
const { collection, getDocs, addDoc } = require('firebase/firestore');
const { db } = require('../config/firebase');
const AWS = require('aws-sdk');

// Configuración de S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const suscripcionFlow = addKeyword(['suscribirme'])
    .addAnswer('🙌 ¡Iniciemos tu suscripción! Por favor, indícame tu nombre completo.', null, async (ctx, { flowDynamic }) => {
        ctx.session.pasoActual = 'nombre'; // Paso actual
    })
    .addAnswer(null, null, async (ctx, { flowDynamic }) => {
        if (ctx.session.pasoActual === 'nombre') {
            ctx.session.nombre = ctx.body;
            ctx.session.pasoActual = 'telefono';
            await flowDynamic(['Gracias. Ahora, dime tu número de teléfono.']);
        }
    })
    .addAnswer(null, null, async (ctx, { flowDynamic }) => {
        if (ctx.session.pasoActual === 'telefono') {
            ctx.session.telefono = ctx.body;
            ctx.session.pasoActual = 'correo';
            await flowDynamic(['Perfecto. Ahora, indícame tu correo electrónico (opcional).']);
        }
    })
    .addAnswer(null, null, async (ctx, { flowDynamic }) => {
        if (ctx.session.pasoActual === 'correo') {
            ctx.session.correo = ctx.body;
            ctx.session.pasoActual = 'comprobante';
            await flowDynamic(['Por último, envía una foto del comprobante de pago.']);
        }
    })
    .addAnswer(null, null, async (ctx, { flowDynamic }) => {
        if (ctx.session.pasoActual === 'comprobante') {
            if (!ctx.body.startsWith('https://')) {
                await flowDynamic(['❌ Necesito que envíes una imagen válida como comprobante.']);
                return;
            }

            const imageUrl = ctx.body;
            ctx.session.comprobante = imageUrl; // Guardamos el URL temporal

            try {
                // Subir la imagen a S3
                const s3Params = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `comprobantes/${Date.now()}-${ctx.session.nombre}.jpg`, // Nombre único
                    Body: Buffer.from(imageUrl.split(',')[1], 'base64'),
                    ContentType: 'image/jpeg',
                };
                const upload = await s3.upload(s3Params).promise();

                ctx.session.s3Comprobante = upload.Location; // URL pública en S3
                ctx.session.pasoActual = 'membresia';

                await flowDynamic([
                    'Comprobante recibido. Ahora, selecciona tu membresía.',
                    'Un momento, estamos obteniendo nuestras membresías disponibles...',
                ]);

                // Obtener membresías de Firebase
                const querySnapshot = await getDocs(collection(db, 'membresias'));
                let membresias = '💪 Estas son las opciones de membresía:\n';
                const opciones = [];

                querySnapshot.forEach((doc, index) => {
                    const data = doc.data();
                    membresias += `${index + 1}. ${data.nombre} - S/${data.precio}\n`;
                    opciones.push({ id: index + 1, ...data });
                });

                ctx.session.membresiasDisponibles = opciones; // Guardamos las opciones
                await flowDynamic([
                    { body: membresias },
                    'Por favor, escribe el número de la membresía que deseas elegir.',
                ]);
            } catch (error) {
                console.error('Error al subir comprobante a S3:', error);
                await flowDynamic(['Lo siento, hubo un error procesando tu comprobante. Intenta nuevamente.']);
            }
        }
    })
    .addAnswer(null, null, async (ctx, { flowDynamic }) => {
        if (ctx.session.pasoActual === 'membresia') {
            const opcion = parseInt(ctx.body.trim(), 10);
            const membresia = ctx.session.membresiasDisponibles?.find((item) => item.id === opcion);

            if (!membresia) {
                await flowDynamic(['❌ Opción no válida. Por favor, selecciona una de las opciones enumeradas.']);
                return;
            }

            ctx.session.membresia = membresia;

            try {
                // Guardar datos en Firebase
                await addDoc(collection(db, 'suscripciones'), {
                    nombre: ctx.session.nombre,
                    telefono: ctx.session.telefono,
                    correo: ctx.session.correo || '',
                    membresia: membresia.nombre,
                    comprobante: ctx.session.s3Comprobante,
                    fecha: new Date().toISOString(),
                });

                await flowDynamic([
                    `✅ Has seleccionado la membresía *${membresia.nombre}* por S/${membresia.precio}.`,
                    'Tu suscripción ha sido registrada exitosamente. ¡Gracias! 🎉',
                    'Ahora puedes separar turnos o asistir al gimnasio según tu membresía.',
                ]);
                ctx.session.pasoActual = null; // Reiniciamos el flujo
            } catch (error) {
                console.error('Error al guardar suscripción en Firebase:', error);
                await flowDynamic(['Lo siento, no pude registrar tu suscripción. Intenta nuevamente.']);
            }
        }
    });

module.exports = suscripcionFlow;
