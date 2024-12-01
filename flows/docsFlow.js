const { addKeyword } = require('@bot-whatsapp/bot');
const { guardarSesion, } = require('../utils/sesion'); // Asegúrate de que la ruta sea correcta
const flowDocs = addKeyword(['cerrar','logout']).addAnswer(
    ['Si deseas cerrar sesión y registrar otro participante, escribe *logout*.'],
    { capture: true },
    async (ctx, { flowDynamic }) => {
        if (ctx.body.toLowerCase() === 'logout') {
            // Limpiar la sesión de Firestore
            await guardarSesion(ctx.from, {});
            return await flowDynamic('¡Has cerrado sesión correctamente! Ahora puedes registrar a otro participante.');
        }

        return await flowDynamic('¡Gracias por utilizar nuestro servicio!');
    }
);

module.exports = flowDocs;