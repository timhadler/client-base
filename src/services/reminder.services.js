const reminderModels = require('../models/reminder.models');
const clientModels = require('../models/client.models');
const attemptModels = require('../models/attempt.models');
const db = require('../database');

// Returns paginated reminder data for a given filter
// Returns row count for overdue, today, this month, and followUp filters
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

    // Get total count for the current filter
    const totalCount = await reminderModels.getReminderCount(filter, userId);

    return {
        listCounts: { overdue: overdueCount, today: todayCount, thisMonth: thisMonthCount, followUp: followUpCount },
        listData: reminders, 
        total: totalCount
    };
};

// Creates a new appointment attempt and reminder
// Updates clients next contact field
exports.addReminder = async function({ date, important, note, reminderCount, clientId, userId }) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Create new appointment attempts
        const attemptId = await attemptModels.createAttempt(clientId, userId, connection);

        // Create reminder and update next contact
        await reminderModels.createReminder(attemptId, date, important, note, reminderCount, clientId, userId, connection);
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

/**
 * Implements the CRM workflow logic
 * 
 * @description
 * This function handles the completion of a reminder within a transactional context.
 * It updates the reminder status, client contact timestamps, manages attempt lifecycle, 
 * and optionally creates new reminders based on the outcome.
 * 
 *  @decision_table
 * | method | outcome    | moveToNextCycle | createNewReminder | Behavior                                                                                     |
 * |--------|------------|-----------------|-------------------|----------------------------------------------------------------------------------------------|
 * | call   | booked     | false           | false             | Complete reminder, resolve attempt, update client last contact                                             |
 * | call   | booked     | true            | false             | Complete reminder, resolve attempt, create new attempt, update client last contact                         |
 * | call   | declined   | false           | false             | Complete reminder, resolve attempt, update client last contact                                             |
 * | call   | declined   | true            | false             | Complete reminder, resolve attempt, create new attempt, update client last contact                         |
 * | call   | no_answer  | false           | false             | Complete reminder, abandon attempt                                                                         |
 * | call   | no_answer  | false           | true              | Complete reminder, create new reminder (count+1)                                                           |
 * | call   | no_answer  | true            | false             | Complete reminder, abandon attempt, create new attempt                                                     |
 * | call   | followup   | false           | false             | Do nothing, expect user to add new reminder for outcome: followup                                          |
 * | call   | followup   | false           | true              | Complete reminder, create new reminder (count+1), update client last contact                               |
 * | text   | waiting    | false           | false             | Complete reminder, abandon attempt                                                                         |
 * | text   | waiting    | true            | false             | Complete reminder, abandon attempt, create new attempt                                                     |
 * | text   | waiting    | false           | true              | Complete reminder, create new reminder (count+1)                                                           |
 * | email  | waiting    | false           | false             | Complete reminder, abandon attempt                                                                         |
 * | email  | waiting    | true            | false             | Complete reminder, abandon attempt, create new attempt                                                     |
 * | email  | waiting    | false           | true              | Complete reminder, create new reminder (count+1)                                                           |
 * | ignored| none       | false           | false             | Complete reminder, abandon attempt, NO client timestamp or reminder count updates                          |
 * | ignored| none       | true            | false             | Complete reminder, abandon attempt, create new attempt, NO client timestamp or reminder count updates      |
  
 * 
 * @workflow
 * 1. Resolve business logic (outcome, reminder creation rules)
 * 2. Begin database transaction
 * 3. Determine newAttemptId for new reminder (existing or create new if moveToNextCycle)
 * 4. Set first_reminder_sent_at if this is reminder #0
 * 5. Abandon attempt if outcome requires it
 * 6. Create new reminder if needed (with appropriate count and attempt ID)
 * 7. Complete and update current reminder (outcome, count)
 * 8. Update attempt (outcome, count)
 * 9. Resolve attempt if outcome is terminal
 * 10. Update client contact timestamps
 * 11. Commit transaction (or rollback on error)
 */

exports.completeReminder = async function({
    clientId,
    userId,
    reminderId,
    reminderCount,
    method,
    outcome,
    createNewReminder,
    moveToNextCycle,
    newReminderDate,
    newReminderNote
}) {
    // Exit if not creating a new reminder with outcome = followup
    if (outcome === 'followup' && !createNewReminder) { return };

    const resolveObj = resolveOutcome(method, outcome, reminderCount, createNewReminder, moveToNextCycle);      // Get action plan
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Increment reminder count unles reminder ignored
        const currentReminderCount = (method === 'ignored') ? reminderCount : Number(reminderCount) + 1;

        let currentAttemptId = await reminderModels.getAttemptIdFromReminder(reminderId, userId, connection);
        let newAttemptId;

        // If moving to next cycle, create a new appointment attempt
        if (moveToNextCycle) {
            newAttemptId = await attemptModels.createAttempt(clientId, userId, connection);
        } else {
            newAttemptId = currentAttemptId;
        }

        // Set first reminder sent if this is the first reminder
        if (reminderCount === 0 && method !== 'ignored') {
            await attemptModels.setFirstReminderSentAt(currentAttemptId, userId, connection);
        }

        // Abandon appointment attempt if not resolved and not creating a new reminder
        if (resolveObj.abandonAttempt) {
            await attemptModels.abandonAttempt(currentAttemptId, userId, connection);
        }

        // Optional: create new reminder
        if (resolveObj.createReminder) {
            // Use false as placeholder for 'important' for now
            await reminderModels.createReminder(newAttemptId, newReminderDate, false, newReminderNote, resolveObj.newReminderCount, clientId, userId, connection);
        }

        // Set current reminder complete and update outcome, reminderCount
        await reminderModels.completeReminder(reminderId, method, resolveObj.outcome, currentReminderCount, userId, connection);

        // Update appointment attempt and update outcome, reminderCount
        await attemptModels.updateAttempt(currentAttemptId, resolveObj.outcome, currentReminderCount, userId, connection);

        // Resolve appointment attempt
        if (outcome === 'booked' || outcome === 'declined') {
            await attemptModels.resolveAttempt(currentAttemptId, userId, connection);
        }

        // Update nextFollowUp client field
        await clientModels.updateClientNextContact(clientId, userId, connection);

        // Update client lastContact field
        if (resolveObj.updateLastContact) {
            await clientModels.updateClientLastContact(clientId, userId, connection);
        }

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

/***********************************************************
 * Helpers
 ***********************************************************/
// Returns the action plan for resolving a reminder
function resolveOutcome(method, outcome, oldReminderCount, createNewReminder, moveToNextCycle) {
    let obj =  {
        outcome: outcome,
        createReminder: createNewReminder || moveToNextCycle,
        updateLastContact: outcome === 'booked' || outcome === 'declined' || outcome === 'followup',
        abandonAttempt: !createNewReminder && outcome !== 'booked' && outcome !== 'declined', 
        newReminderCount: moveToNextCycle ? 0 : Number(oldReminderCount) + 1
    };

    // If no immediate outcome, set based ion method
    if (!outcome && (method === 'text' || method ==='email')) {
        obj.outcome = 'waiting';
    } else if (method === 'ignored') {
        obj.outcome = 'none';
    }

    return obj;
}