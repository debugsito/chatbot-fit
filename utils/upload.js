const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const subirImagenAS3 = async (imageBuffer, imageName) => {
    const params = {
        Bucket: 'tu-bucket', // Cambia por tu bucket de S3
        Key: imageName,
        Body: imageBuffer,
        ContentType: 'image/jpeg', // Ajusta según el tipo de imagen
        ACL: 'public-read', // Hace la imagen accesible públicamente
    };

    try {
        const data = await s3.upload(params).promise();
        return data.Location; // Retorna la URL de la imagen
    } catch (error) {
        console.error('Error subiendo imagen a S3:', error);
        throw new Error('Error al subir imagen a S3');
    }
};

module.exports = { subirImagenAS3 };