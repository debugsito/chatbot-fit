const { addKeyword } = require('@bot-whatsapp/bot');
const { collection, getDocs, addDoc } = require('firebase/firestore');
const { db } = require('../config/firebase');
const { guardarSesion, obtenerSesion } = require('../utils/sesion'); // Asegúrate de que la ruta sea correcta
const { subirImagenAS3 } = require('../utils/upload'); // Asegúrate de que la ruta sea correcta

// Flujo de suscripción
const suscripcionFlow = addKeyword(['suscribirme'])
    .addAnswer(
        ['¡Hola! 😄 Vamos a iniciar tu suscripción.', 'Por favor, indícame tu nombre completo.'],
        { capture: true },

        async (ctx, { flowDynamic, endFlow }) => {
            // Verificamos si la sesión ya existe en Firestore
            let sessionData = await obtenerSesion(ctx.from); // Usamos ctx.from como identificador único

            if (!sessionData) {
                sessionData = {}; // Si no existe, inicializamos la sesión vacía
            }

            // Guardamos el nombre en la sesión
            sessionData.nombre = ctx.body;
            await guardarSesion(ctx.from, sessionData); // Guardamos la sesión

            return await flowDynamic(`Encantado *${sessionData.nombre}*, continuemos...`);
        }
    )
    .addAnswer(
        ['¿Tienes un correo electrónico que quieras proporcionar? (opcional)'],
        { capture: true },

        async (ctx, { flowDynamic }) => {
            // Recuperamos la sesión desde Firestore
            let sessionData = await obtenerSesion(ctx.from);

            // Guardamos el correo en la sesión
            sessionData.correo = ctx.body.trim();
            await guardarSesion(ctx.from, sessionData); // Guardamos la sesión

            return await flowDynamic('Un momento, estamos obteniendo nuestras membresías disponibles...');
        }
    )
    .addAnswer(
        ['💪 Estamos obteniendo nuestras membresías, un momento...'],
        null, // No se captura respuesta aquí, solo se muestra el mensaje
        async (ctx, { flowDynamic }) => {
            try {
                // Obtenemos las membresías de la base de datos
                const querySnapshot = await getDocs(collection(db, 'membresias'));
                let membresias = [];
                querySnapshot.forEach((doc) => {
                    membresias.push({
                        id: doc.id,
                        nombre: doc.data().nombre,
                        precio: doc.data().precio,
                    });
                });

                // Guardamos las membresías en la sesión
                let sessionData = await obtenerSesion(ctx.from);
                sessionData.membresias = membresias;
                await guardarSesion(ctx.from, sessionData); // Guardamos las membresías en la sesión

                // Creamos el mensaje con las opciones de membresías
                let optionsMessage = '💪 Aquí están nuestras membresías disponibles:\n';
                membresias.forEach((membresia, index) => {
                    optionsMessage += `${index + 1}. ${membresia.nombre} - S/${membresia.precio}\n`;
                });

                // Enviar las opciones para seleccionar la membresía
                await flowDynamic(optionsMessage);
            } catch (error) {
                console.error('Error al obtener membresías: ', error);
                await flowDynamic(['Lo siento, no pude obtener las membresías en este momento.']);
            }
        }
    )
    .addAnswer(
        ['Responde con el número de la membresía que deseas.'],
        { capture: true },

        async (ctx, { flowDynamic, endFlow }) => {
            // Recuperamos la sesión desde Firestore
            let sessionData = await obtenerSesion(ctx.from);

            const opcion = parseInt(ctx.body.trim(), 10);
            const membresia = sessionData.membresias?.[opcion - 1];
            if (!membresia) {
                return await flowDynamic(['❌ Opción no válida. Por favor, selecciona una de las opciones enumeradas.']);
            }

            // Guardamos la membresía seleccionada en la sesión
            sessionData.membresia = membresia;
            await guardarSesion(ctx.from, sessionData);

            return await flowDynamic(`Has seleccionado la membresía *${membresia.nombre}* por S/${membresia.precio}. Envíame una foto del comprobante de pago.`);
        }
    )
    .addAnswer(
        ['Envía una imagen del comprobante de pago.'],
        { capture: true },

        async (ctx, { flowDynamic, endFlow }) => {
            // Recuperamos la sesión desde Firestore
            let sessionData = await obtenerSesion(ctx.from);

            const imageBuffer = ctx.media; // Suponiendo que `ctx.media` contiene la imagen enviada
            const imageName = `comprobante_${ctx.from}_${Date.now()}.jpg`; // Nombre único para la imagen

            try {
                //const imagenUrl = await subirImagenAS3(imageBuffer, imageName); // Subimos la imagen a S3
                sessionData.comprobante = imageName; // Guardamos la URL de la imagen en la sesión

                // Guardamos la suscripción en Firestore
                const suscripcionData = {
                    nombre: sessionData.nombre,
                    correo: sessionData.correo || '',
                    telefono: ctx.from, // Tomamos el teléfono de ctx.from
                    membresia: sessionData.membresia,
                    imagenUrl: imageName,
                    fecha: new Date(),
                };

                await addDoc(collection(db, 'suscripciones'), suscripcionData);
                return await flowDynamic(`🎉 ¡Gracias por tu suscripción! Todo está registrado exitosamente.`);
            } catch (error) {
                console.error('Error al guardar suscripción: ', error);
                return await flowDynamic(['❌ Hubo un error al guardar el comprobante. Intenta nuevamente.']);
            }
        }
    )
    .addAnswer(
        ['🎉 ¡Gracias por tu suscripción!'],
        null, // No se captura respuesta
        async (ctx, { flowDynamic, gotoFlow }) => {
            // Marcamos la sesión como logueada
            let sessionData = await obtenerSesion(ctx.from);
            sessionData.isLoggedIn = true;
            await guardarSesion(ctx.from, sessionData); // Guardamos la sesión actualizada

            await flowDynamic('Ahora, vamos a reservar tu turno. Te mostraré los turnos disponibles... ');
            return gotoFlow(require('./reservaTurnoFlow'))
        }
    );

module.exports = suscripcionFlow;
