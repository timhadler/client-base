const db = require('../database');

/***********************************************************
 * Read
 ***********************************************************/
// Returns the total conversion rate of appointment attempts by outcome
exports.conversionRateByOutcome = async function(userId, conn = db) {
    const sqlQuery = `
        SELECT
            outcome,
            COUNT(*) AS total_attempts,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
        FROM appointment_attempts
        WHERE status = 'resolved'
        AND user_id = ?
        GROUP BY outcome
        ORDER BY total_attempts DESC;
    `;
    return await conn.query(sqlQuery, [userId]);
}

// Gets the conversion rate by outcome over the last n days
exports.conversionRateOverPeriod = async function (n, userId, conn = db) {
    const sqlQuery = `
        SELECT
            outcome,
            total_attempts,
            ROUND(total_attempts * 100.0 / SUM(total_attempts) OVER (), 2) AS percentage
        FROM (
            SELECT
                outcome,
                COUNT(*) AS total_attempts
            FROM appointment_attempts
            WHERE status = 'resolved'
            AND createdAt >= NOW() - INTERVAL ? DAY
            GROUP BY outcome
        ) sub
        ORDER BY total_attempts DESC;
    `;
    return await conn.query(sqlQuery, [userId, n]);
}

// Returns the average reminders sent per outcome
// Tells how many touches it takes to reach each result
exports.averageRemindersByOutcome = async function(userId, conn = db) {
    const sqlQuery = `
    SELECT
        outcome,
        AVG(total_reminders_sent) AS avg_reminders,
        MIN(total_reminders_sent) AS min_reminders,
        MAX(total_reminders_sent) AS max_reminders
    FROM appointment_attempts
    WHERE status = 'resolved'
    AND user_id = ?
    GROUP BY outcome
    ORDER BY avg_reminders DESC;
    `;
    return await conn.query(sqlQuery, [userId]);
}

/***********************************************************
 * Create
 ***********************************************************/
// Creates a new appointment attempt for a client
exports.createAttempt = async function(clientId, userId, conn = db) {
    const sqlQuery = `
        INSERT INTO appointment_attempts (client_id, user_id)
        SELECT c.id, ?
        FROM clients c
        WHERE c.public_id = ?
        RETURNING id;
    `;
    const rows = await conn.query(sqlQuery, [userId, clientId]);
    return rows[0].id;
}

/***********************************************************
 * Edit
 ***********************************************************/
exports.updateAttempt = async function(id, outcome, totalRemindersSent, userId, conn = db) {
    const sqlQuery = `
        UPDATE appointment_attempts
        SET outcome = ?, total_reminders_sent = ?, outcome_set_at = NOW()
        WHERE id = ? 
        AND user_id = ?;
    `;
    await conn.query(sqlQuery, [outcome, totalRemindersSent, id, userId]);
}

exports.abandonAttempt = async function(id, userId, conn = db) {
    const sqlQuery = `
        UPDATE appointment_attempts
        SET status = 'abandoned'
        WHERE id = ? 
        AND user_id = ?;
    `;
    await conn.query(sqlQuery, [ id, userId]);
}

// Completes an appointment attempt
exports.resolveAttempt = async function(id, userId, conn = db) {
    const sqlQuery = `
        UPDATE appointment_attempts
        SET status = 'resolved', resolved_at = NOW()
        WHERE id = ? 
        AND user_id = ?;
    `;
    await conn.query(sqlQuery, [ id, userId]);
}

// Sets an appointment attempts first_reminder_sent_at field
exports.setFirstReminderSentAt = async function(id, userId, conn = db) {
    const sqlQuery = `
        UPDATE appointment_attempts
        SET first_reminder_sent_at = NOW()
        WHERE id = ?
        AND user_id = ?;
    `;
    await conn.query(sqlQuery, [id, userId]);
}