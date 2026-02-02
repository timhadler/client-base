const reminderModels = require('../models/reminder.models');
const clientModels = require('../models/client.models');
const db = require('../database');

// Returns paginated reminder data for a given filter
// Returns row count for overdue, today, initial, and followUp filters
exports.loadReminderList = async function({ filter, reminderCount, limit, offset, userId }) {
    // Get counts
    const [overdueCount, todayCount, thisMonthCount, followUpCount] = await Promise.all([
        reminderModels.getReminderCount('overdue', userId),
        reminderModels.getReminderCount('today', userId),
        reminderModels.getReminderCount('thisMonth', userId),
        reminderModels.getReminderCount('followUp', userId),
    ]);

    // Get reminder list
    const reminders = await reminderModels.getReminderList(filter, limit, offset, userId, reminderCount);
    // Need to add to counts call as well

    // Get total count for the current filter
    const totalCount = await reminderModels.getReminderCount(filter, userId);

    return {
        listCounts: { overdue: overdueCount, today: todayCount, thisMonth: thisMonthCount, initial: initialCount, followUp: followUpCount },
        listData: reminders, 
        total: totalCount
    };
};

// Adds a new reminder
// Updates clients next contact field
exports.addReminder = async function({ date, important, note, reminderCount, clientId, userId }) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await reminderModels.createReminder(date, important, note, reminderCount, clientId, userId, connection);
        await clientModels.updateClientNextContact(clientId, userId, connection);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Edits a reminder
// Updates client's next contact field
exports.editReminder = async function({ date, important, note, id, userId }) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await reminderModels.editReminder(id, date, important, note, userId, connection);
        await clientModels.updateClientNextContactFromReminder(id, userId, connection);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Deletes a reminder
// Updates clients next contact field
// Fetches public client id to update next contact
exports.deleteReminder = async function({ id, userId }) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get clients id from reminder
        const clientId = await reminderModels.getClientIdFromReminder(id, userId, connection);

        // Delete reminder
        await reminderModels.deleteReminder(id, userId, connection);

        // Update clients nect contact date
        if (clientId) {
            await clientModels.updateClientNextContact(clientId, userId, connection);
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}