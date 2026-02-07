const db = require('../config/database');

/***********************************************************
 * Read
 ***********************************************************/
// Fetches filtered reminder list
exports.getReminderList = async function(filter, limit, offset, user_id, reminderCount = 'all', conn = db) {
    let condition = getReminderFilterCondition(filter);
    let order = "ASC"

    if (filter !== 'completed') { 
       condition = "reminders.status != 'complete' AND " + condition;
    } else {
        order = "DESC";
    }
  
    if (reminderCount !== 'all') {
        condition += ` AND reminders.reminderCount = ${parseInt(reminderCount)}`;
    }

    const sqlQuery = `
        SELECT clients.public_id as clientId, reminders.id, rDate as date, reminders.status, reminderCount, reminders.important, outcome, reminders.note, name, company 
        FROM reminders 
        INNER JOIN clients on reminders.client_id = clients.id 
        WHERE ${condition} AND clients.user_id = ? 
        ORDER BY rDate ${order}
        LIMIT ${limit}
        OFFSET ${offset}
    `;
    const rows = await conn.query(sqlQuery, [user_id]);

    return rows;
}

// Fetches the total count of reminders within a given filter
exports.getReminderCount = async function(filter, user_id, conn = db) {
    let condition = getReminderFilterCondition(filter);
    
    if (filter !== 'completed') { 
       condition = "reminders.status != 'complete' AND " + condition;
    }

    const sqlQuery = `
        SELECT COUNT(*) as total
        FROM reminders 
        INNER JOIN clients on reminders.client_id = clients.id 
        WHERE ${condition} AND clients.user_id = ?
    `;
    
    const result = await conn.query(sqlQuery, [user_id]);
    return result[0].total ? result[0].total : null;
}

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

exports.getAttemptIdFromReminder = async function(reminder_id, user_id, conn = db) {
    const sqlQuery = `
        SELECT appointment_attempt_id as id
        FROM reminders
        WHERE reminders.id = ?
        AND user_id = ?
    `;
    const rows = await conn.query(sqlQuery, [reminder_id, user_id])
    
    return(rows[0].id ? rows[0].id : null);
}

/***********************************************************
 * Create
 ***********************************************************/
exports.createReminder = async function(attemptId, date, important, note, reminderCount, clientId, user_id, conn = db) {
    const sqlQuery = `
        INSERT INTO reminders (client_id, appointment_attempt_id, rDate, status, important, note, reminderCount, user_id) 
        SELECT c.id, ?, ?, 'pending', ?, ?, ?, ?
        FROM clients c 
        WHERE c.public_id = ?
    `;
    await conn.query(sqlQuery, [attemptId, date, important, note, reminderCount, user_id, clientId]);
}

/***********************************************************
 * Edit
 ***********************************************************/
exports.editReminder = async function(id, date, important, note, user_id) {
    const sqlQuery = "UPDATE reminders SET rDate=?, important=?, note=? WHERE id=? AND user_id=?";
    await db.query(sqlQuery, [date, important, note, id, user_id]);
};

exports.setReminderOutcome = async function(id, outcome, user_id, conn = db) {
    const sqlQuery = "UPDATE reminders SET outcome=?, respondedAt = NOW() WHERE id=? AND user_id=?";
    await conn.query(sqlQuery, [outcome, id, user_id]);
}

exports.completeReminder = async function(id, method, outcome, reminderCount, user_id, conn = db) {
    const sqlQuery = "UPDATE reminders SET status='complete', method=?, outcome=?, reminderCount=?, completedAt = NOW() WHERE id=? AND user_id=?";
    await conn.query(sqlQuery, [method, outcome, reminderCount, id, user_id]);
}

/***********************************************************
 * Delete
 ***********************************************************/
// Delete a reminder
exports.deleteReminder = async function(id, user_id, conn = db) {
    const sqlQuery = "DELETE FROM reminders WHERE id=? AND user_id=? RETURNING client_id";
    const result = await conn.query(sqlQuery, [id, user_id]);

    return result[0].clientId ? result[0].clientId : null;
}

/***********************************************************
 * Helpers
 ***********************************************************/
function getReminderFilterCondition(filter) {
    switch (filter) {
        case 'overdue': return "DATE(rDate) < CURDATE()";
        case 'today': return "DATE(rDate) = CURDATE()";
        case 'thisMonth' : return "rDate >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND rDate <  DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')";
        case 'initial': return "reminderCount = 1";
        case 'followUp': return "reminderCount > 1";
        case 'completed': return "reminders.status = 'complete'";
        default: return "reminders.status != 'complete'";
    }
}
