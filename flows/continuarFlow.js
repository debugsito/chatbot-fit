const { addKeyword } = require('@bot-whatsapp/bot');

const continuarFlow = addKeyword(['continuar suscripción'])
    .addAnswer(async (ctx, { flowDynamic }) => {
        const pasoActual = ctx.session.pasoActual || 'inicio';

        switch (pasoActual) {
            case 'inicio':
                await flowDynamic(['Iniciaremos tu suscripción. Por favor, indícame tu nombre completo.']);
                ctx.session.pasoActual = 'nombre';
                break;
            case 'nombre':
                await flowDynamic(['Por favor, indícame tu nombre completo para continuar.']);
                break;
            case 'telefono':
                await flowDynamic(['Por favor, indícame tu número de teléfono para continuar.']);
                break;
            case 'correo':
                await flowDynamic(['¿Cuál es tu correo electrónico? (opcional)']);
                break;
            case 'comprobante':
                await flowDynamic(['Por último, envía una foto del comprobante de pago.']);
                break;
            default:
                await flowDynamic(['No estoy seguro en qué paso quedaste. ¿Podrías escribir *suscribirme* para empezar de nuevo?']);
        }
    });

module.exports = continuarFlow;
