const { doc, getDoc, setDoc } = require('firebase/firestore');
const { db } = require('../config/firebase');

// Función para guardar la sesión en Firestore
const guardarSesion = async (sessionId, sessionData) => {
    const sessionRef = doc(db, 'sesiones', sessionId); // Refleja un documento en la colección 'sesiones'
    await setDoc(sessionRef, sessionData, { merge: true }); // Guardar o actualizar el documento con la sesión
};

// Función para obtener la sesión desde Firestore
const obtenerSesion = async (sessionId) => {
    const sessionRef = doc(db, 'sesiones', sessionId); // Refleja el documento específico de la sesión
    const docSnap = await getDoc(sessionRef); // Obtener el documento de Firestore
    return docSnap.exists() ? docSnap.data() : {}; // Si existe, devuelve los datos, de lo contrario, un objeto vacío
};


module.exports = { guardarSesion, obtenerSesion };
