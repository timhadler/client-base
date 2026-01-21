const reminderModel = require('../models/reminder.models');
// /const db = require('../database');

// Returns paginated reminder data for a given filter
// Returns row count for overdue, today, initial, and followUp filters
exports.loadReminderList = async function({ filter, limit, offset, userId }) {
    // Get counts
    const [overdueCount, todayCount, initialCount, followUpCount] = await Promise.all([
        reminderModel.nReminderListCount('overdue', userId),
        reminderModel.nReminderListCount('today', userId),
        reminderModel.nReminderListCount('initial', userId),
        reminderModel.nReminderListCount('followUp', userId),
    ]);

    // Get reminder list
    const reminders = await reminderModel.getReminderList(filter, limit, offset, userId);

    return {
        listCounts: { overdue: overdueCount, today: todayCount, initial: initialCount, followUp: followUpCount },
        listData: reminders
    };
};
