const db = require('../database');

/***********************************************************
 * Read
 ***********************************************************/
// Fetchs all interactions associated with a client id
exports.getClientInteractions = async function (id, user_id, conn = db) {
    const sqlQuery = `
        SELECT i.id, i.reminder_id as reminderId, method, outcome, i.createdAt as date 
        FROM interactions i 
        JOIN clients c 
        ON i.client_id = c.id 
        WHERE c.public_id = ? 
        AND c.user_id = ? 
        ORDER BY i.createdAt 
        DESC
    `;
    const rows = await conn.query(sqlQuery, [id, user_id]);

    return rows;
}

/***********************************************************
 * Create
 ***********************************************************/
// Creates an interaciton
exports.createInteraction  =async function(clientId, reminderId, method, outcome, user_id, conn = db) {
    const sqlQuery = `
        INSERT INTO interactions (client_id, reminder_id, method, outcome, user_id)
        SELECT c.id, ?, ?, ?, ?
        FROM clients c
        WHERE c.public_id = ?
    `;
    await conn.query(sqlQuery, [reminderId, method, outcome, user_id, clientId]);
};

/***********************************************************
 * Edit
 ***********************************************************/
// Sets the outcome of an interaction
// Auto updates the respondedAt date to current date
exports.setInteractionOutcome = async function(id, outcome, user_id, conn = db) {
    const sqlQuery = "UPDATE interactions SET outcome=?, respondedAt=CURDATE() WHERE id=? AND user_id=?";
    await conn.query(sqlQuery, [outcome, id, user_id]);
}