const { addKeyword } = require('@bot-whatsapp/bot');

const flowDocs = addKeyword(['doc', 'documentacion', 'documentación']).addAnswer(
    [
        'Aquí encuentras la documentación, recuerda que puedes mejorarla:',
        'https://bot-whatsapp.netlify.app/',
        '\nEscribe *2* para el siguiente paso.',
    ],
    null,
    null,
    []
);

module.exports = flowDocs;