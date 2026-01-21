const interactionModel = require('../models/interaction.models');
const reminderModel = require('../models/reminder.models');
const db = require('../database');

// Record an interation
// Creates a new interaction
// Sets current reminder status to compelte
// Optionally creates a new reminder
// - incremenets reminder counter for new reminders, resets counter if moving to next cycle
// NEED to update contact date fields in clients table, reminders (last contact etc)
exports.recordInteraction = async function({
    clientId,
    userId,
    reminderId,
    reminderCount,
    method,
    outcome,
    createNewReminder = false,
    moveToNextCycle = false,
    newReminderDate,
    newReminderNote
}) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // If moving to next cycle, reset reminder count and set outcome to end_attmept
        let newReminderCount = 0;
        if (moveToNextCycle) {
            newReminderCount = 1;
            outcome = 'end_attempt';
        } else {
            newReminderCount = Number(reminderCount) + 1;
        }

        // Create interaction
        await interactionModel.createInteraction(clientId, reminderId, method, outcome, userId, connection);

        // Optional: create new reminder
        if (createNewReminder || moveToNextCycle) {
            // Use false as placeholder for 'important'
            await reminderModel.createReminder(newReminderDate, false, newReminderNote, newReminderCount, clientId, userId, connection);
        }

        // Set current reminder complete
        await reminderModel.completeReminder(reminderId, outcome, userId, connection);
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Updates interaction and reminder outcomes
exports.respondInteraction = async function(id, reminderId, outcome, user_id) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Ignore no_answer outcomes
        if (outcome !== 'no_answer') {
            // Update outcomes
            await interactionModel.setInteractionOutcome(id, outcome, user_id, connection);
            await reminderModel.setReminderOutcome(reminderId, outcome, user_id, connection);
        }
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};