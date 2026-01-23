const db = require('../database');

/***********************************************************
 * Read
 ***********************************************************/
exports.nReminderListCount = async function(filter, user_id, conn = db) {
    let condition = getReminderFilterCondition(filter);
    if (filter !== 'completed') condition = "reminders.status != 'complete' AND " + condition;
    
    const sqlQuery = "SELECT COUNT(*) as n FROM reminders WHERE " + condition + " AND user_id = ?";
    const rows = await conn.query(sqlQuery, [user_id]);

    return rows[0].n;
}

// Fetches filtered reminder list
exports.getReminderList = async function(filter, limit, offset, user_id, conn = db) {
    let condition = getReminderFilterCondition(filter);
    if (filter !== 'completed') condition = "reminders.status != 'complete' AND " + condition;

    const sqlQuery = `
        SELECT clients.public_id as clientId, reminders.id, rDate as date, reminders.status, reminderCount, reminders.important, outcome, reminders.note, name, company 
        FROM reminders 
        INNER JOIN clients on reminders.client_id = clients.id 
        WHERE ${condition} AND clients.user_id = ? 
        ORDER BY rDate 
        LIMIT ${limit}
        OFFSET ${offset}
    `;
    const rows = await conn.query(sqlQuery, [user_id]);

    return rows;
}

// Fetches the public_id of the client associated with a given remidner id
exports.getClientIdFromReminder = async function(reminder_id, user_id, conn = db) {
    const sqlQuery = `
        SELECT clients.public_id as id
        FROM clients
        INNER JOIN reminders ON reminders.client_id = clients.id
        WHERE reminders.id = ?
        AND reminders.user_id = ?
    `;
    const rows = await conn.query(sqlQuery, [reminder_id, user_id])
    
    return(rows[0].id ? rows[0].id : null);
}

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

/***********************************************************
 * Edit
 ***********************************************************/
// Edits a reminder entry
exports.editReminder = async function(id, date, important, note, user_id) {
    const sqlQuery = "UPDATE reminders SET rDate=?, important=?, note=? WHERE id=? AND user_id=?";
    await db.query(sqlQuery, [date, important, note, id, user_id]);
};

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

/***********************************************************
 * Delete
 ***********************************************************/
// Delete a reminder
exports.deleteReminder = async function(id, user_id, conn = db) {
    const sqlQuery = "DELETE FROM reminders WHERE id=? AND user_id=?";
    await conn.query(sqlQuery, [id, user_id]);
}

/***********************************************************
 * Helpers
 ***********************************************************/
function getReminderFilterCondition(filter) {
    switch (filter) {
        case 'overdue': return "DATE(rDate) < CURDATE()";
        case 'today': return "DATE(rDate) = CURDATE()";
        case 'initial': return "reminderCount = 1";
        case 'followUp': return "reminderCount > 1";
        case 'completed': return "reminders.status = 'complete'";
        default: return "reminders.status != 'complete'";
    }
}
