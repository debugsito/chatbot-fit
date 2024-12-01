const axios = require('axios');
const { decryptMediaRetryData } = require('@whiskeysockets/baileys');

async function descargarImagen(imageMessage) {
    try {
        // Validar que `imageMessage` tiene la información necesaria
        if (!imageMessage.url || !imageMessage.mediaKey) {
            throw new Error('La URL o mediaKey no están disponibles.');
        }

        // Descargar el archivo cifrado desde la URL
        const response = await axios.get(imageMessage.url, {
            responseType: 'arraybuffer', // Descargar como buffer
        });
        const encryptedBuffer = Buffer.from(response.data);
        console.log(imageMessage.url)
        console.log(response.data)
        console.log(encryptedBuffer)

        // Desencriptar el archivo utilizando `mediaKey`
        const decryptedBuffer = await decryptMediaRetryData(encryptedBuffer, imageMessage.mediaKey);
        return decryptedBuffer;
    } catch (error) {
        console.error('Error al descargar o descifrar la imagen:', error);
        throw error;
    }
}

module.exports = { descargarImagen };