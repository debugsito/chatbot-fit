const { addKeyword } = require('@bot-whatsapp/bot');
const flowSecundario = require('./secundarioFlow');

const flowGracias = addKeyword(['gracias', 'grac']).addAnswer(
    [
        '🚀 Puedes aportar a este proyecto:',
        '[*opencollective*] https://opencollective.com/bot-whatsapp',
        '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
        '[*patreon*] https://www.patreon.com/leifermendez',
        '\nEscribe *2* para el siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
);

module.exports = flowGracias;
