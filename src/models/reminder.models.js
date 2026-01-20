const db = require('../database');

/***********************************************************
 * Create
 ***********************************************************/
// Creates a reminder entry
exports.createReminder = async function(date, important, note, reminderCount, clientId, user_id, conn = db) {
    const sqlQuery = `
        INSERT INTO reminders (client_id, rDate, status, important, note, reminderCount, user_id) 
        SELECT c.id, ?, 'pending', ?, ?, ?, ?
        FROM clients c 
        WHERE c.public_id = ?
    `;
    await conn.query(sqlQuery, [date, important, note, reminderCount, user_id, clientId]);
}

// Sets the outcome of a reminder
exports.setReminderOutcome = async function(id, outcome, user_id, conn = db) {
    const sqlQuery = "UPDATE reminders SET outcome=? WHERE id=? AND user_id=?";
    await conn.query(sqlQuery, [outcome, id, user_id]);
}

// Edits reminder status to complete
exports.completeReminder = async function(id, outcome, user_id, conn = db) {
    const sqlQuery = "UPDATE reminders SET status='complete', outcome=? WHERE id=? AND user_id=?";
    await conn.query(sqlQuery, [outcome, id, user_id]);
}