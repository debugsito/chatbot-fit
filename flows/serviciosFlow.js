// flows/serviciosFlow.js
const { addKeyword } = require('@bot-whatsapp/bot');
const { collection, getDocs } = require('firebase/firestore');
const { db } = require('../config/firebase');

const serviciosFlow = addKeyword(['servicios', 'entrenamientos', 'clases'])
    .addAnswer('🏋️ Estamos obteniendo nuestros servicios, un momento...', null, async (ctx, { flowDynamic }) => {
        console.log("Consulta de servicios iniciada");
        try {
            const querySnapshot = await getDocs(collection(db, 'servicios'));
            let servicios = '🏋️ Ofrecemos los siguientes servicios:\n';
            querySnapshot.forEach((doc) => {
                servicios += `- ${doc.data().nombre}\n`;
            });

            // Enviar el resultado usando flowDynamic
            await flowDynamic([{ body: servicios }]);
        } catch (error) {
            console.error('Error al obtener servicios: ', error);
            await flowDynamic(['Lo siento, no pude obtener los servicios en este momento.']);
        }
    });

module.exports = serviciosFlow;
