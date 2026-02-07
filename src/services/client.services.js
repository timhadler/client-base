const clientModels = require('../models/client.models');
const reminderServices = require('../services/reminder.services');
const db = require('../config/database');

// Returns paginated client list according to filters
// Also returns the total number of clients
exports.getClientList= async function({ search, status, priority, limit, offset, userId }) {
    const nClients = await clientModels.nTotalClients(userId);
    const clientList = await clientModels.getClientList(limit, offset, search, status, priority, userId);

    return {
        nClients: nClients, 
        clientList: clientList
    }
}

// Returns all active reminders for a given client
exports.getActiveReminders= async function(id, userId, limit) {
    let reminders = await clientModels.getClientActiveReminders(id, userId, limit);

    return reminders;
}

// Creates a new client entry
// Optionally creates a new reminder for the client
exports.createClient = async function({userId, createReminder, reminderDate, clientData}) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const clientId = await clientModels.addClient(clientData, userId, connection);

        // Optional reminder if selected
        if (createReminder && reminderDate) {
            const note = "Initial reminder";
            const important = false;                // PLACEHOLDER
            const reminderCount = 1;

            await reminderServices.addReminder({ date: reminderDate, important, note, reminderCount, clientId, userId }, connection);
        }
    
        await connection.commit();
        return clientId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Deletes client data and any active reminders
exports.deleteClientData = async function(id, userId) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await clientModels.deleteActiveReminders(id, userId, connection);
        await clientModels.deleteClient(id, userId, connection);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}