// flows/principalFlow.js
const { addKeyword } = require('@bot-whatsapp/bot');
const membresiasFlow = require('./membresiasFlow');
const serviciosFlow = require('./serviciosFlow');
const turnosFlow = require('./turnosFlow');
const docsFlow = require('./docsFlow');

const principalFlow = addKeyword(['hola', 'inicio', 'empezar'])
    .addAnswer('🙌 ¡Hola! Bienvenido a *FitCloud Assistant*')
    .addAnswer(
        [
            'Te ofrezco las siguientes opciones:',
            '👉 Escribe *membresias* para ver nuestras membresías',
            '👉 Escribe *servicios* para ver los entrenamientos y clases disponibles',
            '👉 Escribe *turnos* para ver los horarios disponibles',
        ],
        null,
        null,
        [membresiasFlow, serviciosFlow, turnosFlow, docsFlow]
    );

module.exports = principalFlow;
