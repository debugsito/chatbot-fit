const { addKeyword } = require('@bot-whatsapp/bot');

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(
    'Este mensaje es el paso siguiente, no tiene botones.'
);

module.exports = flowSecundario;
