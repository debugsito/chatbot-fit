const { createProvider } = require('@bot-whatsapp/bot')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')

const adapterProvider = createProvider(BaileysProvider);

module.exports = adapterProvider;
