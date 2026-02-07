const db = require('../database');

/***********************************************************
 * Read
 ***********************************************************/
// Get total number of clients in database
exports.nTotalClients = async function(user_id, conn = db) {
    const sqlQuery = "SELECT COUNT(*) as n FROM clients WHERE user_id = ?";
    const rows = await conn.query(sqlQuery, [user_id]);

    return rows[0].n;
};

// Fetches filtered, paginated client list
exports.getClientList = async function (limit, offset, search, status, priority, user_id, conn = db) {
    const values = [];
    let whereClauses = [];

    // Search filter
    if (search) {
        whereClauses.push(`(name LIKE ? OR company LIKE ? OR email LIKE ?)`);
        const searchPattern = `%${search}%`;
        values.push(searchPattern, searchPattern, searchPattern);
    }

    // Status filter
    if (status) {
        whereClauses.push(`status = ?`);
        values.push(status);
    }

    // Priority filter
    if (priority) {
        whereClauses.push(`priority = ?`);
        values.push(priority);
    }

    const whereSQL = whereClauses.length
        ? `WHERE ${whereClauses.join(' AND ')}`
        : `WHERE 1 = 1`;

    const sql = `
        SELECT public_id AS id, name, email, company, status, priority,
               lastContact, nextFollowup, createdAt
        FROM clients
        ${whereSQL}
        AND user_id = ?
        ORDER BY createdAt DESC
        LIMIT ${limit} OFFSET ${offset}
    `;

    values.push(user_id);

    const rows = await conn.query(sql, values);
    return rows;
};

// Fetches client details with a given id
exports.getClientDetails = async function(id, user_id, conn = db) {
    const sqlQuery = `
        SELECT public_id as id, name, first_name, last_name, email, phone, company, position, status, priority, source, 
            createdAt, lastContact, notes, addressLine1 as line1, addressLine2 as line2, city, state, postcode, country 
        FROM clients 
        WHERE public_id = ? 
        AND user_id = ?
    `;
    const rows = await conn.query(sqlQuery, [id, user_id]);

    return rows[0];
}

// Fetches all reminders associated with a client id
exports.getClientReminders = async function(id, user_id, limit, conn = db) {
    limit = limit ? limit : 10;

    const sqlQuery = `
        SELECT reminders.id, rDate as date, reminders.status, note, method, outcome, important, reminderCount, respondedAt 
        FROM reminders 
        JOIN clients on reminders.client_id = clients.id 
        WHERE clients.public_id = ? 
        AND clients.user_id = ?
        ORDER BY rDate
        LIMIT ?
    `;
    const rows = await conn.query(sqlQuery, [id, user_id, limit]);
    return rows;
}

// Fetches all reminders with statius 'pending' for a given client id
exports.getClientActiveReminders = async function(id, user_id, limit, conn = db) {
       const sqlQuery = `
       SELECT reminders.id, rDate as date, reminders.status, note, outcome, important, reminderCount 
       FROM reminders 
       JOIN clients on reminders.client_id = clients.id 
       WHERE clients.public_id = ? 
       AND clients.user_id = ?
       AND reminders.status = 'pending'
       ORDER BY rDate
       LIMIT ?
    `;
    const rows = await conn.query(sqlQuery, [id, user_id, limit]);
    return rows;
}

// Fetches all reminders with status complete for a given client id
exports.getClientCompleteReminders = async function(id, user_id, limit, conn = db) {
       const sqlQuery = `
       SELECT reminders.id, rDate as date, reminders.status, note, method, outcome, important, reminderCount, respondedAt as respondedDate, completedAt as completedDate
       FROM reminders 
       JOIN clients on reminders.client_id = clients.id 
       WHERE clients.public_id = ? 
       AND clients.user_id = ?
       AND reminders.status = 'complete'
       ORDER BY completedDate
       DESC
       LIMIT ?
    `;
    const rows = await conn.query(sqlQuery, [id, user_id, limit]);
    return rows;
}

// Fetches the public id of a client by their internal id
exports.getPublicId = async function(id, user_id, conn = db) {
    const sqlQuery = `
        SELECT public_id 
        FROM clients 
        WHERE id = ? 
        AND user_id = ?
    `;
    const rows = await conn.query(sqlQuery, [id, user_id]);

    return rows[0];
}

/***********************************************************
 * Create
 ***********************************************************/
exports.addClient = async (client, user_id, conn = db) => {
    const public_id = await conn.query(`
        INSERT INTO clients (
            first_name, last_name, name, email, phone, company, position, status, priority, notes, source,
            addressLine1, addressLine2, city, state, country, postcode, user_id
            )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING public_id
        `,
        [
            client.firstName,
            client.lastName,
            client.firstName + ' ' + client.lastName,
            client.email,
            client.phone,
            client.company,
            client.position,
            client.status,
            client.priority,
            client.notes,
            client.source,
            client.line1,
            client.line2,
            client.city,
            client.state,
            client.country,
            client.postcode,
            user_id,
        ]
    );
    return public_id[0] ? public_id[0].public_id : null;
};

/***********************************************************
 * Edit
 ***********************************************************/
exports.editClient = async (id, client, user_id, conn = db) => {
    await conn.query(`
        UPDATE clients 
        SET 
            first_name = ?, last_name = ?, name = ?, email = ?, phone = ?, company = ?, position = ?, 
            status = ?, priority = ?, notes = ?, source = ?,
            addressLine1 = ?, addressLine2 = ?, city = ?, state = ?, country = ?, postcode = ?
        WHERE public_id = ? 
        AND user_id = ?
        `,
        [
            client.first_name,
            client.last_name,
            client.first_name + ' ' + client.last_name,
            client.email,
            client.phone,
            client.company,
            client.position,
            client.status,
            client.priority,
            client.notes,
            client.source,
            client.line1,
            client.line2,
            client.city,
            client.state,
            client.country,
            client.postcode,
            id,
            user_id, 
        ]
    );
};

// Updates lastContact field for a client
// Sets the lastContact field to the current date
exports.updateClientLastContact = async function(id, user_id, conn = db) {
    const sqlQuery = `
        UPDATE clients 
        SET lastContact = CURDATE()
        WHERE public_id = ? AND user_id = ?
    `;
    await conn.query(sqlQuery, [id, user_id]);
}

// Updates the next contact field for a client
// - Finds the closest reminder date for the client and sets nextFollowup to that date
// - If no reminder exists, nextFollowup is set to NULL
exports.updateClientNextContact = async function(clientId, userId, conn = db) {
    const sqlQuery = `
        UPDATE clients c
        LEFT JOIN (
            SELECT r.client_id, MIN(r.rDate) AS next_date
            FROM reminders r
            WHERE r.user_id = ?
            AND r.status = 'pending'
            GROUP BY r.client_id
        ) rmin ON c.id = rmin.client_id
        SET c.nextFollowup = rmin.next_date
        WHERE c.public_id = ? AND c.user_id = ?;
    `;

    await conn.query(sqlQuery, [userId, clientId, userId]);
};

// Updates the nextFollowup field for a client with a given reminder id
// - Finds the closest reminder date for the client associated with reminderId and sets nextFollowup to that date
// - If no reminder exists, nextFollowup is set to NULL
exports.updateClientNextContactFromReminder = async function(reminderId, userId, conn = db) {
    const sqlQuery = `
        UPDATE clients c
        JOIN reminders r ON r.client_id = c.id
        LEFT JOIN (
            SELECT r2.client_id, MIN(r2.rDate) AS next_date
            FROM reminders r2
            WHERE r2.user_id = ?
            AND r2.status = 'pending'
            GROUP BY r2.client_id
        ) rmin ON c.id = rmin.client_id
        SET c.nextFollowup = rmin.next_date
        WHERE r.id = ?
        AND r.user_id = ?
        AND c.user_id = ?;
    `;

    await conn.query(sqlQuery, [userId, reminderId, userId, userId]);
}


/***********************************************************
 * Delete
 ***********************************************************/
exports.deleteClient = async function(id, user_id, conn = db) {
    const sqlQuery = "DELETE FROM clients WHERE public_id= ?  AND user_id=?";
    await conn.query(sqlQuery, [id, user_id]);
}

// Deletes active reminders for a given client id
exports.deleteActiveReminders = async function(id, user_id, conn = db) {
    const sqlQuery = `
        DELETE r 
        FROM reminders r 
        INNER JOIN clients c 
        ON r.client_id = c.id 
        WHERE c.public_id = ? 
        AND r.status = 'pending' 
        AND c.user_id= ? 
    `;
    await conn.query(sqlQuery, [id, user_id]);
}