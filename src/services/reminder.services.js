const reminderModels = require('../models/reminder.models');
const clientModels = require('../models/client.models');
// /const db = require('../database');

// Returns paginated reminder data for a given filter
// Returns row count for overdue, today, initial, and followUp filters
exports.loadReminderList = async function({ filter, limit, offset, userId }) {
    // Get counts
    const [overdueCount, todayCount, initialCount, followUpCount] = await Promise.all([
        reminderModels.nReminderListCount('overdue', userId),
        reminderModels.nReminderListCount('today', userId),
        reminderModels.nReminderListCount('initial', userId),
        reminderModels.nReminderListCount('followUp', userId),
    ]);

    // Get reminder list
    const reminders = await reminderModels.getReminderList(filter, limit, offset, userId);

    return {
        listCounts: { overdue: overdueCount, today: todayCount, initial: initialCount, followUp: followUpCount },
        listData: reminders
    };
};

// Adds a new reminder
// Updates clients next contact field
exports.addReminder = async function({ date, important, note, reminderCount, clientId, userId }) {
    await reminderModels.createReminder(date, important, note, reminderCount, clientId, userId);
    await clientModels.updateClientNextContact(clientId, userId);
}

// Edits a reminder
// Updates client's next contact field
exports.editReminder = async function({ date, important, note, id, userId }) {
    await reminderModels.editReminder(id, date, important, note, userId);
    await clientModels.updateClientNextContactFromReminder(id, userId);
}

// Deletes a reminder
// Updates clients next contact field
// Fetches public client id to update next contact
exports.deleteReminder = async function({ id, userId }) {
    // Get clients id from reminder
    const clientId = await reminderModels.getClientIdFromReminder(id, userId);

    // Delete reminder
    await reminderModels.deleteReminder(id, userId);

    // Update clients nect contact date
    await clientModels.updateClientNextContact(clientId, userId);
}