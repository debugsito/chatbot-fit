const { addKeyword } = require('@bot-whatsapp/bot');
const flowDocs = require('./docsFlow');
const flowGracias = require('./graciasFlow');

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('🙌 Hola, bienvenido a este *Chatbot*')
    .addAnswer(
        [
            'Te comparto los siguientes enlaces de interés sobre el proyecto:',
            '👉 *doc* para ver la documentación',
            '👉 *gracias* para ver cómo apoyar el proyecto',
            '👉 *discord* para unirte al Discord',
        ],
        null,
        null,
        [flowDocs, flowGracias]
    );

module.exports = flowPrincipal;
