const { addKeyword } = require('@bot-whatsapp/bot');
const { collection, getDocs, addDoc } = require('firebase/firestore');
const { db } = require('../config/firebase');
const { obtenerSesion, guardarSesion } = require('../utils/sesion'); // Asegúrate de que esta función esté bien configurada

const reservaTurnoFlow = addKeyword(['reservar turno', 'reservar', 'turno'])
    // Paso 1: Verificar si el usuario está logueado al iniciar la interacción
    .addAnswer('🔒 Primero verificaré si estás logueado...', null,async (ctx, { flowDynamic }) => {
        const sessionData = await obtenerSesion(ctx.from);

        // Verificar si el usuario está logueado
        if (!sessionData || !sessionData.isLoggedIn) {
            return await flowDynamic('❌ No estás logueado. Completa la suscripción para poder reservar un turno.');
        }

        // Paso 2: Si está logueado, obtener los turnos disponibles
        const querySnapshot = await getDocs(collection(db, 'turnos'));

        let turnos = [];
        querySnapshot.forEach((doc) => {
            turnos.push({
                id: doc.id,
                dia: doc.data().dia,
                horario: doc.data().horario,
            });
        });

        // Verificar si hay turnos disponibles
        if (turnos.length === 0) {
            return await flowDynamic('❌ No hay turnos disponibles en este momento.');
        }

        // Guardar los turnos en la sesión
        sessionData.turnos = turnos;
        await guardarSesion(ctx.from, sessionData);

        // Paso 3: Crear el mensaje con los turnos disponibles y esperar la selección del usuario
        let optionsMessage = '🕑 Estos son los turnos disponibles:\n';
        turnos.forEach((turno, index) => {
            optionsMessage += `${index + 1}. ${turno.dia} - Disponibilidad: ${turno.horario}\n`;
        });

        // Mostrar los turnos disponibles
        await flowDynamic(optionsMessage);
        return await flowDynamic('Responde con el número del turno que deseas reservar.');
    })
    // Paso 4: Esperar la respuesta del usuario con el número del turno a reservar
    .addAnswer(
        'Por favor, responde con el número del turno que deseas reservar.',
        { capture: true }, // Captura la respuesta del usuario

        async (ctx, { flowDynamic }) => {
            const sessionData = await obtenerSesion(ctx.from);

            // Verificar si el usuario está logueado
            if (!sessionData || !sessionData.isLoggedIn) {
                return await flowDynamic('❌ No puedes reservar un turno sin estar logueado. Completa la suscripción primero.');
            }

            // Verificar que se haya seleccionado un turno válido
            const opcion = parseInt(ctx.body.trim(), 10);
            const turnoSeleccionado = sessionData.turnos?.[opcion - 1];

            if (!turnoSeleccionado) {
                return await flowDynamic('❌ Opción no válida. Selecciona un turno disponible.');
            }

            // Guardar la reserva del turno en la base de datos
            try {
                // Aquí estamos creando un documento en la colección "reservas"
                const reservaRef = await addDoc(collection(db, 'reservas'), {
                    userId: ctx.from,  // O el ID del usuario
                    turnoId: turnoSeleccionado.id,
                    dia: turnoSeleccionado.dia,
                    horario: turnoSeleccionado.horario,
                    fechaReserva: new Date(),
                    estado: 'reservado', // Puede ser "reservado", "confirmado", etc.
                });

                console.log('Reserva guardada con éxito:', reservaRef.id);

                // Guardar la reserva en la sesión del usuario
                sessionData.turnoReservado = turnoSeleccionado;
                await guardarSesion(ctx.from, sessionData);

                return await flowDynamic(`🎉 ¡Has reservado el turno *${turnoSeleccionado.dia} a las ${turnoSeleccionado.horario}*!`);
            } catch (error) {
                console.error('Error al guardar la reserva:', error);
                return await flowDynamic('❌ Ocurrió un error al guardar tu reserva. Intenta nuevamente más tarde.');
            }
        }
    )
    // Paso 5: Confirmar si el usuario desea cancelar o modificar el turno
    .addAnswer(
        'Si deseas cancelar tu turno o hacer otro cambio, por favor avísame.',
        null, // Esto es solo para finalizar la interacción
        async (ctx, { endFlow }) => {
            return endFlow();
        }
    );

module.exports = reservaTurnoFlow;
