// flows/membresiasFlow.js
const { addKeyword } = require('@bot-whatsapp/bot');
const { collection, getDocs } = require('firebase/firestore');
const { db } = require('../config/firebase');

const membresiasFlow = addKeyword(['membresia', 'membresías', 'membresias'])
    .addAnswer('💪 Estamos obteniendo nuestras membresías, un momento...',null, async (ctx, { flowDynamic }) => {
        console.log("Consulta de membresías iniciada");
        try {
            const querySnapshot = await getDocs(collection(db, 'membresias'));
            let membresias = '💪 Aquí están nuestras membresías:\n';
            querySnapshot.forEach((doc) => {
                membresias += `- ${doc.data().nombre} S/${doc.data().precio} \n`;
            });
            
            // Enviar el resultado usando flowDynamic
            await flowDynamic([{body: membresias}]);
        } catch (error) {
            console.error('Error al obtener membresías: ', error);
            await flowDynamic(['Lo siento, no pude obtener las membresías en este momento.']);
        }
    });

module.exports = membresiasFlow;
