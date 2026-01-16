const db = require("../database");

/***********************************************************
 * Retrieval
 ***********************************************************/
// Get number of clients in database
exports.nTotalClients = async function() {
    const sqlQuery = "SELECT COUNT(*) as n FROM clients";
    const rows = await db.query(sqlQuery);

    return rows[0].n;
};

// Returns the number of reminders with a given filter for the reminders list
exports.nReminderListCount = async function(filter) {
    let condition = "NOT reminders.status = 'complete'";
    switch (filter) {
        case 'overdue':
            condition += " AND DATE(rDate) < CURDATE()";
            break;
        case 'today':
            condition += " AND DATE(rDate) = CURDATE()";
            break;
        // Add 'waiting' here 
    }
    const sqlQuery = "SELECT COUNT(*) as n FROM reminders WHERE " + condition;
    const rows = await db.query(sqlQuery);

    return rows[0].n;
}

// Fetches client list (clients)
exports.getClientList = async function(limit, offset, search, status, priority) {
    const values = [];
    let whereClauses = [];

    // Search filter: name, company, or email
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

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
        SELECT public_id as id, name, email, company, status, priority, lastContact, nextFollowup, createdAt
        FROM clients
        ${whereSQL}
        ORDER BY createdAt DESC
        LIMIT ` + limit + ` OFFSET ` + offset 
    ;
    const rows = await db.query(sql, values);
    return rows;
}

// Fetches client details with a given id
exports.getClientDetails = async function(id) {
    const sqlQuery = "SELECT public_id as id, name, first_name, last_name, email, phone, company, position, status, priority, source, createdAt, lastContact, notes, addressLine1 as line1, addressLine2 as line2, city, state, postcode, country FROM clients WHERE public_id = ?";
    rows = await db.query(sqlQuery, [id]);

    return rows[0];
}

// Fetches all reminders associated with a client id
exports.getClientReminders = async function(id) {
    const sqlQuery = "SELECT reminders.id, rDate as date, reminders.status, note, outcome, important FROM reminders JOIN clients on reminders.client_id = clients.id WHERE clients.public_id = ?";
    rows = await db.query(sqlQuery, [id]);

    return rows;
}

// Fetchs all interactions associated with a client id
exports.getClientInteractions = async function (id) {
    const sqlQuery = "SELECT i.id, method, outcome, i.createdAt as date FROM interactions i JOIN clients c ON i.client_id = c.id WHERE c.public_id = ? ORDER BY i.createdAt DESC";
    rows = await db.query(sqlQuery, [id]);

    return rows;
}

// Fetches filtered reminder list
exports.getReminderList = async function(filter, limit, offset) {
    let condition = "NOT reminders.status = 'complete'";
    switch (filter) {
        case 'overdue':
            condition += " AND DATE(rDate) < CURDATE()";
            break;
        case 'today':
            condition += " AND DATE(rDate) = CURDATE()";
            break;
        case 'upcoming':
            condition += " AND DATE(rDate) > CURDATE()";
            break;
        case 'completed':
            condition = "reminders.status = 'complete'";
            break;
        // Add 'waiting' here 
    }
    const sqlQuery = `SELECT clients.public_id as clientId, reminders.id, rDate as date, reminders.status, reminders.important, outcome, reminders.note, name, company FROM reminders INNER JOIN clients on reminders.client_id = clients.id WHERE ${condition} ORDER BY rDate LIMIT ` + limit + ` OFFSET ` + offset;
    rows = await db.query(sqlQuery);

    return rows;
}

// Retrives the client name and ids of clients with no reminder Date
exports.getClientsNoRDate = async function() {
    const sqlQuery = "SELECt public_id as id, name FROM clients LEFT JOIN reminders ON clients.id = reminders.client_id WHERE reminders.id IS NULL";
    const rows = await db.query(sqlQuery);

    return rows;
}

// Fetches the public id of a client by their internal id
exports.getPublicId = async function(id) {
    const sqlQuery = "SELECT public_id FROM clients WHERE id = ?";
    const rows = await db.query(sqlQuery, [id]);

    return rows[0];
}

/***********************************************************
 * Creation
 ***********************************************************/
// Creates a client entry
exports.addClient = async (client) => {
    const result = await db.query(
        `INSERT INTO clients 
        (first_name, last_name, name, email, phone, company, position, status, priority, notes, source,
         addressLine1, addressLine2, city, state, country, postcode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        ]
    );
    return result.insertId;
};

// Creates a reminder entry
exports.createReminder = async function(date, important, note, clientId) {
    const sqlQuery = `
        INSERT INTO reminders (client_id, rDate, status, important, note, reminderCount) 
        SELECT c.id, ?, 'pending', ?, ?, 1
        FROM clients c 
        WHERE c.public_id = ?
    `;
    await db.query(sqlQuery, [date, important, note, clientId]);
}

// Creates an interaciton
exports.createInteraction  =async function(clientId, reminderId, method, outcome) {
    const sqlQuery = `
        INSERT INTO interactions (client_id, reminder_id, method, outcome)
        SELECT c.id, ?, ?, ?
        FROM clients c
        WHERE c.public_id = ?
    `;
    await db.query(sqlQuery, [reminderId, method, outcome, clientId]);
};

/***********************************************************
 * Edit
 ***********************************************************/

// Edits a client entry
exports.editClient = async (id, client) => {
    await db.query(
        `UPDATE clients SET 
            first_name = ?, last_name = ?, name = ?, email = ?, phone = ?, company = ?, position = ?, 
            status = ?, priority = ?, notes = ?, source = ?,
            addressLine1 = ?, addressLine2 = ?, city = ?, state = ?, country = ?, postcode = ?
         WHERE public_id = ?`,
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
        ]
    );
};

// Edits a reminder entry
exports.editReminder = async function(id, date, important, note) {
    const sqlQuery = "UPDATE reminders SET rDate=?, important=?, note=? WHERE id=?";
    await db.query(sqlQuery, [date, important, note, id]);
};

// Edits reminder status to complete
exports.completeReminder = async function(id) {
    const sqlQuery = "UPDATE reminders SET status='complete' WHERE id=?";
    await db.query(sqlQuery, [id]);
}

// Adds a response to an interaction
exports.respondInteraction = async function(id, outcome) {
    const sqlQuery = "UPDATE interactions SET outcome=?, respondedAt=CURDATE() WHERE id=?";
    await db.query(sqlQuery, [outcome, id]);
};

/***********************************************************
 * Delete
 ***********************************************************/
exports.deleteClient = async function(id) {
    const sqlQuery = "DELETE FROM clients WHERE public_id=?";
    await db.query(sqlQuery, id);
}

exports.deleteActiveReminders = async function(id) {
    const sqlQuery = "DELETE r FROM reminders r INNER JOIN clients c ON r.client_id = c.id WHERE c.public_id = ? AND r.status = 'pending'";
    await db.query(sqlQuery, id);
}

exports.deleteClientReminder = async function(id) {
    const sqlQuery = "DELETE FROM reminders WHERE id=?";
    await db.query(sqlQuery, id);
}

exports.deleteUser = async function(id) {
    const sqlQuery = "DELETE FROM users WHERE id=?";
    await db.query(sqlQuery, id);
}