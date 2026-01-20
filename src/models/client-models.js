const db = require("../database");

/***********************************************************
 * Retrieval
 ***********************************************************/
// Get number of clients in database
exports.nTotalClients = async function(user_id) {
    const sqlQuery = "SELECT COUNT(*) as n FROM clients WHERE user_id = ?";
    const rows = await db.query(sqlQuery, [user_id]);

    return rows[0].n;
};

// Returns the number of reminders with a given filter for the reminders list
exports.nReminderListCount = async function(filter, user_id) {
    let condition = "NOT reminders.status = 'complete'";
    switch (filter) {
        case 'overdue':
            condition += " AND DATE(rDate) < CURDATE()";
            break;
        case 'today':
            condition += " AND DATE(rDate) = CURDATE()";
            break;
        case 'initial':
            condition += " AND reminderCount = 1";
            break;
        case 'followUp':
            condition += " AND reminderCount > 1";
            break;
    }
    const sqlQuery = "SELECT COUNT(*) as n FROM reminders WHERE " + condition + " AND user_id = ?";
    const rows = await db.query(sqlQuery, [user_id]);

    return rows[0].n;
}

// Fetches client list (clients)
exports.getClientList = async function (limit, offset, search, status, priority, user_id
) {
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

    const rows = await db.query(sql, values);
    return rows;
};


// Fetches client details with a given id
exports.getClientDetails = async function(id, user_id) {
    const sqlQuery = "SELECT public_id as id, name, first_name, last_name, email, phone, company, position, status, priority, source, createdAt, lastContact, notes, addressLine1 as line1, addressLine2 as line2, city, state, postcode, country FROM clients WHERE public_id = ? AND user_id = ?";
    rows = await db.query(sqlQuery, [id, user_id]);

    return rows[0];
}

// Fetches all reminders associated with a client id
exports.getClientReminders = async function(id, user_id) {
    const sqlQuery = "SELECT reminders.id, rDate as date, reminders.status, note, outcome, important, reminderCount FROM reminders JOIN clients on reminders.client_id = clients.id WHERE clients.public_id = ? AND clients.user_id = ?";
    rows = await db.query(sqlQuery, [id, user_id]);

    return rows;
}

// Fetchs all interactions associated with a client id
exports.getClientInteractions = async function (id, user_id) {
    const sqlQuery = "SELECT i.id, i.reminder_id as reminderId, method, outcome, i.createdAt as date FROM interactions i JOIN clients c ON i.client_id = c.id WHERE c.public_id = ? AND c.user_id = ? ORDER BY i.createdAt DESC";
    rows = await db.query(sqlQuery, [id, user_id]);

    return rows;
}

// Fetches filtered reminder list
exports.getReminderList = async function(filter, limit, offset, user_id) {
    let condition = "NOT reminders.status = 'complete'";
    switch (filter) {
        case 'overdue':
            condition += " AND DATE(rDate) < CURDATE()";
            break;
        case 'today':
            condition += " AND DATE(rDate) = CURDATE()";
            break;
        case 'initial':
            condition += " AND reminderCount = 1";
            break;
        case 'followUp':
            condition += " AND reminderCount > 1";
            break;
        case 'completed':
            condition = "reminders.status = 'complete' ";
            break;
    }
    const sqlQuery = `SELECT clients.public_id as clientId, reminders.id, rDate as date, reminders.status, reminderCount, reminders.important, outcome, reminders.note, name, company FROM reminders INNER JOIN clients on reminders.client_id = clients.id WHERE ${condition} AND clients.user_id = ? ORDER BY rDate LIMIT ${limit} OFFSET ${offset}`;
    rows = await db.query(sqlQuery, [user_id]);

    return rows;
}

// Retrieves the client name and ids of clients with no reminder Date   
// exports.getClientsNoRDate = async function() {
//     const sqlQuery = "SELECt public_id as id, name FROM clients LEFT JOIN reminders ON clients.id = reminders.client_id WHERE reminders.id IS NULL";
//     const rows = await db.query(sqlQuery);

//     return rows;
// }

// Fetches the public id of a client by their internal id
exports.getPublicId = async function(id, user_id) {
    const sqlQuery = "SELECT public_id FROM clients WHERE id = ? AND user_id = ?";
    const rows = await db.query(sqlQuery, [id, user_id]);

    return rows[0];
}

/***********************************************************
 * Creation
 ***********************************************************/
// Creates a client entry
exports.addClient = async (client, user_id) => {
    const result = await db.query(
        `INSERT INTO clients 
        (first_name, last_name, name, email, phone, company, position, status, priority, notes, source,
         addressLine1, addressLine2, city, state, country, postcode, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            user_id,
        ]
    );
    return result.insertId;
};

// Creates a reminder entry
exports.createReminder = async function(date, important, note, reminderCount, clientId, user_id) {
    const sqlQuery = `
        INSERT INTO reminders (client_id, rDate, status, important, note, reminderCount, user_id) 
        SELECT c.id, ?, 'pending', ?, ?, ?, ?
        FROM clients c 
        WHERE c.public_id = ?
    `;
    await db.query(sqlQuery, [date, important, note, reminderCount, user_id, clientId]);
}

// Creates an interaciton
exports.createInteraction  =async function(clientId, reminderId, method, outcome, user_id) {
    const sqlQuery = `
        INSERT INTO interactions (client_id, reminder_id, method, outcome, user_id)
        SELECT c.id, ?, ?, ?, ?
        FROM clients c
        WHERE c.public_id = ?
    `;
    await db.query(sqlQuery, [reminderId, method, outcome, user_id, clientId]);
};

/***********************************************************
 * Edit
 ***********************************************************/
// Edits a client entry
exports.editClient = async (id, client, user_id) => {
    await db.query(
        `UPDATE clients SET 
            first_name = ?, last_name = ?, name = ?, email = ?, phone = ?, company = ?, position = ?, 
            status = ?, priority = ?, notes = ?, source = ?,
            addressLine1 = ?, addressLine2 = ?, city = ?, state = ?, country = ?, postcode = ?
         WHERE public_id = ? AND user_id = ?`,
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

// Edits a reminder entry
exports.editReminder = async function(id, date, important, note, user_id) {
    const sqlQuery = "UPDATE reminders SET rDate=?, important=?, note=? WHERE id=? AND user_id=?";
    await db.query(sqlQuery, [date, important, note, id, user_id]);
};

// Edits reminder status to complete
exports.completeReminder = async function(id, user_id) {
    const sqlQuery = "UPDATE reminders SET status='complete' WHERE id=? AND user_id=?";
    await db.query(sqlQuery, [id, user_id]);
}

// Adds a response to an interaction, updates reminder outcome
exports.respondInteraction = async function(id, reminderId, outcome, user_id) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        await connection.query(
            "UPDATE interactions SET outcome=?, respondedAt=CURDATE() WHERE id=? AND user_id=?",
            [outcome, id, user_id]
        );
        
        await connection.query(
            "UPDATE reminders SET outcome=? WHERE id=? AND user_id=?",
            [outcome, reminderId, user_id]
        );
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/***********************************************************
 * Delete
 ***********************************************************/
exports.deleteClient = async function(id, user_id) {
    const sqlQuery = "DELETE FROM clients WHERE public_id=? AND user_id=?";
    await db.query(sqlQuery, [id, user_id]);
}

exports.deleteActiveReminders = async function(id, user_id) {
    const sqlQuery = "DELETE r FROM reminders r INNER JOIN clients c ON r.client_id = c.id WHERE c.public_id = ? AND r.status = 'pending' AND c.user_id=?";
    await db.query(sqlQuery, [id, user_id]);
}

exports.deleteClientReminder = async function(id, user_id) {
    const sqlQuery = "DELETE FROM reminders WHERE id=? AND user_id=?";
    await db.query(sqlQuery, [id, user_id]);
}

exports.deleteUser = async function(id, user_id) {
    const sqlQuery = "DELETE FROM users WHERE id=?, user_id=?";
    await db.query(sqlQuery, [id, user_id]);
}