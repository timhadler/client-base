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

// Fetches the number of clients in a given list (pending, awaiting, followUp) with user parameters
exports.getListCount = async function(list, d1, d2) {
    const sqlQuery = "SELECT COUNT(clients.id) as n FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE reminders.status = ? AND reminders.rDate BETWEEN '" + d1 + "' AND '" + d2 + "';";
    const rows = await db.query(sqlQuery, list);
    
    return rows[0].n;
};

// Fetches client details with a given id
exports.getClientDetails = async function(id) {
    const sqlQuery = "SELECT public_id as id, name, email, phone, company, position, status, priority, source, createdAt, lastContact, notes, street, city, state, postcode, country FROM clients WHERE public_id = ?";
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
    const sqlQuery = "SELECT method, outcome, i.createdAt as date FROM interactions i JOIN clients c ON i.client_id = c.id WHERE c.public_id = ?";
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
        case 'completed':
            condition = "reminders.status = 'complete'";
            break;
        // Add 'waiting' here 
    }
    const sqlQuery = `SELECT reminders.id, rDate as date, reminders.status, reminders.important, outcome, reminders.note, name FROM reminders INNER JOIN clients on reminders.client_id = clients.id WHERE ${condition} LIMIT ` + limit + ` OFFSET ` + offset;
    rows = await db.query(sqlQuery);

    return rows;
}

// Returns a list of all clients in db with the provided name, used to check for duplicates during import
// exports.getClientsByName = async function(name) {
//     const sqlQuery = "SELECT * from clients WHERE name=?";
//     const rows = await db.query(sqlQuery, name);

//     return rows;
// }

// Retrives the client name and ids of clients with no reminder Date
exports.getClientsNoRDate = async function() {
    const sqlQuery = "SELECT clients.id, name FROM clients LEFT JOIN reminders ON clients.id = reminders.client_id WHERE reminders.id IS NULL";
    const rows = await db.query(sqlQuery);

    return rows;
}

/***********************************************************
 * Creation
 ***********************************************************/
// Creates a client entry
// Returns the id of the newly created client
exports.createClient = async function(name, company, telephone, mobile, email, street, suburb, city, pc) {
    const sqlQuery = "INSERT INTO clients (name, company, home, mobile, email, street, suburb, city, postcode) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";

    await db.query(sqlQuery, [name, company, telephone, mobile, email, street, suburb, city, pc]);
    const rows = await db.query("SELECT MAX(id) AS lastID FROM clients");
    
    return rows[0].lastID;
}

// Creates a reminder entry
exports.createReminder = async function(rDate, status, id) {
    const sqlQuery = "INSERT INTO reminders (rDate, client_id, status) VALUES(?, ?, ?)";
    await db.query(sqlQuery, [rDate, id, status]);
}

// Create an interaction entry
exports.createInteraction = async function(action, id, rId) {
    const sqlQuery = "INSERT INTO interactions (client_id, reminder_id, interaction) VALUES(?, ?, ?)";
    await db.query(sqlQuery, [id, rId, action]);
}

/***********************************************************
 * Edit
 ***********************************************************/

// Edits a client entry
exports.editClient = async function(id, name, company, telephone, mobile, email, street, suburb, city, pc) {
    const sqlQuery = "UPDATE clients SET name=?, company=?, home=?, mobile=?, email=?, street=?, suburb=?, city=?, postcode=? WHERE id=?";
    await db.query(sqlQuery, [name, company, telephone, mobile, email, street, suburb, city, pc, id]);
}

// Edits a reminder entry
exports.editReminder = async function(id, date) {
    const sqlQuery = "UPDATE reminders SET rDate=? WHERE id=?";
    await db.query(sqlQuery, [date, id]);
}

// Edit a reminder entry for a given client id
exports.editClientReminder = async function(id, date, status) {
    const sqlQuery = "UPDATE reminders SET rDate=?, status=? WHERE client_id=?";
    await db.query(sqlQuery, [date, status, id]);
}

exports.setReminderFlag = async function(id, value) {
    const sqlQuery = "UPDATE reminders SET flag=? WHERE id=?";
    await db.query(sqlQuery, [value, id]);
}

/***********************************************************
 * Delete
 ***********************************************************/
exports.deleteClient = async function(id) {
    // Use db transaction to ensure all related data is deleted
    try {
        const client = await db.getConnection();
        await client.query("BEGIN");

        sqlQuery = "DELETE FROM reminders WHERE client_id=" + id;
        await db.query(sqlQuery);

        sqlQuery = "DELETE FROM interactions WHERE client_id=" + id;
        await db.query(sqlQuery);

        sqlQuery = "DELETE FROM notes WHERE client_id=" + id;
        await db.query(sqlQuery);

        sqlQuery = "DELETE FROM clients WHERE id=" + id;
        await db.query(sqlQuery);
        
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

exports.deleteClientReminder = async function(id) {
    const sqlQuery = "DELETE FROM reminders WHERE client_id=?";
    await db.query(sqlQuery, id);
}

exports.deleteUser = async function(id) {
    const sqlQuery = "DELETE FROM users WHERE id=?";
    await db.query(sqlQuery, id);
}