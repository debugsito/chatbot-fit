const { createBot, createFlow } = require('@bot-whatsapp/bot');
const adapterProvider = require('./providers/baileysProvider');
const adapterDB = require('./database/jsonAdapter');

const flowPrincipal = require('./flows/principalFlow');
const QRPortalWeb = require('@bot-whatsapp/portal');

const main = async () => {
    const adapterFlow = createFlow([flowPrincipal]);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
};

main();
