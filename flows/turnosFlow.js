// flows/turnosFlow.js
const { addKeyword } = require('@bot-whatsapp/bot');
const { collection, getDocs } = require('firebase/firestore');
const { db } = require('../config/firebase');

const turnosFlow = addKeyword(['turnos', 'horarios', 'clases disponibles'])
    .addAnswer('🕑 Estamos obteniendo los turnos disponibles, un momento...', null, async (ctx, { flowDynamic }) => {
        console.log("Consulta de turnos iniciada");
        try {
            const querySnapshot = await getDocs(collection(db, 'turnos'));
            let turnos = '🕑 Estos son los turnos disponibles:\n';
            querySnapshot.forEach((doc) => {
                turnos += `- ${doc.data().dia} - ${doc.data().horario}\n`;
            });

            // Enviar el resultado usando flowDynamic
            await flowDynamic([{ body: turnos }]);
        } catch (error) {
            console.error('Error al obtener turnos: ', error);
            await flowDynamic(['Lo siento, no pude obtener los turnos en este momento.']);
        }
    });

module.exports = turnosFlow;
