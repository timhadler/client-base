//const express = require("express");
//const mariadb = require("./../database");

/***********************************************************
 * Retrieval
 ***********************************************************/
// Get number of clients in database
exports.clientNumber = async function(user) {
    const sqlQuery = "SELECT COUNT(*) as n FROM clients";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery);

    db.release();
    return rows[0].n;
};

// Fetches clients from the database, ordered by name
exports.clientList = async function(user, limit, offset) {
    const sqlQuery = "SELECT name, id FROM clients ORDER BY NAME LIMIT " + limit + " OFFSET " + offset;
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery);

    db.release();
    return rows;
};

// Fetches the number of clients in a given list (pending, awaiting, followUp) with user parameters
exports.getListCount = async function(user, list, d1, d2) {
    const sqlQuery = "SELECT COUNT(clients.id) as n FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE reminders.status = ? AND reminders.rDate BETWEEN '" + d1 + "' AND '" + d2 + "';";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery, list);

    db.release();
    return rows[0].n;
};

// Fetches the client details associated with the reminder dates between d1 and d2 and have status of "pending"
exports.pendingList = async function (user, d1, d2, limit, offset, order) {
    let sqlQuery = "SELECT clients.id, name, mobile, rDate, flag, reminders.id AS rId, reminders.status FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE reminders.status='pending' AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY " + order + " LIMIT " + limit + " OFFSET " + offset;
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery);

    db.release();
    return rows;
};

// NO LONGER USING NOANS STATUS, CAN REMOVE EXTRA FUNCTIONS AS THERE WILLL ONLY BE FOLLOWuP STATUS
// Fetches the client details associated with the reminder dates between d1 and d2 and have status "noResponse" or "followUp"
exports.followUpList = async function (user, d1, d2, limit, offset, order) {
    let sqlQuery = "SELECT name, clients.id, rDate, flag, reminders.id AS rId, reminders.status FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE status='followUp' AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY " + order + " LIMIT " + limit + " OFFSET " + offset;
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery);

    db.release();
    return rows;
};

// Fetches the client details associated with reminders that have status "awaitingResponse"
exports.awaitingList = async function (user, d1, d2, limit, offset, order) {
    let sqlQuery = "SELECT name, clients.id, rDate, flag, reminders.id AS rId, reminders.status, latest_created FROM clients INNER JOIN reminders ON clients.id = reminders.client_id ";
    sqlQuery += "LEFT JOIN (SELECT reminder_id, MAX(created) AS latest_created FROM interactions GROUP BY reminder_id) latest_int ON reminders.id = latest_int.reminder_id LEFT JOIN interactions ON reminders.id = interactions.reminder_id AND latest_int.latest_created = interactions.created ";
    sqlQuery += "WHERE reminders.status='awaiting' AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY " + order + " LIMIT " + limit + " OFFSET " + offset;
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery);

    db.release();
    return rows;
};

// Fetches all clients with reminders statuses "completed", limited by 50
exports.completedList = async function (user) {
    const sqlQuery = "SELECT name, clients.id, rDate, reminders.id AS rId, reminders.status, outcome FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE reminders.status='completed' ORDER BY name LIMIT 50";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery);

    db.release();
    return rows;
};

// Fetches all interactions associated with a given reminder
exports.reminderInteractions = async function(user, id) {
    const sqlQuery = "SELECT interaction, created FROM interactions WHERE reminder_id=" + id + " ORDER BY created DESC";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery);

    db.release();
    return rows;
}

// Fethes all notes related to a client with a given id
exports.clientNotes = async function(user, id) {
    const sqlQuery = "SELECT id, note, created FROM notes WHERE client_id = " + id + " ORDER BY created DESC";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery);

    db.release();
    return rows;
}

// Fetches clients resulting from a search query
exports.searchList = async function(user, search) {
    let sqlQuery = "SELECT name, id FROM clients WHERE name LIKE '%" + search + "%'";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery);

    sqlQuery = "SELECT COUNT(DISTINCT clients.id) AS n FROM clients where name LIKE '%" + search + "%'";
    const count = await db.query(sqlQuery);

    if (rows.length > 0) {
        rows[0].n = count[0].n;
    }

    db.release();
    return rows;
}

// Fetches client details with a given id
exports.clientDetails = async function(user, id) {
    const sqlQuery = "SELECT * FROM clients WHERE clients.id=" + id;
    const db = await user.getConnection();
    rows = await db.query(sqlQuery);

    db.release();
    return rows[0];
}

// Retrieves the reminder associated with a client id
exports.clientReminder = async function(user, id) {
    const sqlQuery = "SELECT * from reminders WHERE client_id=? AND status IN ('pending', 'awaiting', 'followUP')";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery, id);

    // Should only be 1 active reminder
    if (rows.length > 1) {
        console.log("Possible bug: more than 1 active reminder for client (id=" + id + ")");
    }
    db.release();
    return rows[0];
}

// Reveives a user with a given id
exports.getUserById = async function(user, id) {
    const sqlQuery = "SELECT * from users WHERE id=?";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery, id);

    db.release();
    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    };
}

// Reveives a user with a given username
exports.getUserByUsername = async function(user, username) {
    const sqlQuery = "SELECT * from users WHERE username=?";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery, username);

    db.release();
    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    };
}

// Returns a list of all clients in db with the provided name
exports.getClientsByName = async function(user, name) {
    const sqlQuery = "SELECT * from clients WHERE name=?";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery, name);

    db.release();
    return rows;
}

// Retrives the client name and ids of clients with no reminder Date
exports.getClientsNoRDate = async function(user) {
    const sqlQuery = "SELECT clients.id, name FROM clients LEFT JOIN reminders ON clients.id = reminders.client_id WHERE reminders.id IS NULL";
    const db = await user.getConnection();
    const rows = await db.query(sqlQuery);

    db.release();
    return rows;
}

/***********************************************************
 * Creation
 ***********************************************************/
// Creates a client entry
// Returns the id of the newly created client
exports.createClient = async function(user, name, company, telephone, mobile, email, street, suburb, city, pc) {
    const sqlQuery = "INSERT INTO clients (name, company, home, mobile, email, street, suburb, city, postcode) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const db = await user.getConnection();
    await db.query(sqlQuery, [name, company, telephone, mobile, email, street, suburb, city, pc]);
    const rows = await db.query("SELECT MAX(id) AS lastID FROM clients");

    db.release();
    return rows[0].lastID;
}

// Creates a reminder entry
exports.createReminder = async function(user, rDate, status, id) {
    const sqlQuery = "INSERT INTO reminders (rDate, client_id, status) VALUES(?, ?, ?)";
    const db = await user.getConnection();
    await db.query(sqlQuery, [rDate, id, status]);
    db.release();
}

// Create an interaction entry
exports.createInteraction = async function(user, action, id, rId) {
    const sqlQuery = "INSERT INTO interactions (client_id, reminder_id, interaction) VALUES(?, ?, ?)";
    const db = await user.getConnection();
    await db.query(sqlQuery, [id, rId, action]);
    db.release();
}

// Creates a note entry
exports.createNote = async function(user, note, id) {
    const sqlQuery = "INSERT INTO notes (note, client_id) VALUES(?, ?)";
    const db = await user.getConnection();
    await db.query(sqlQuery, [note, id]);
    db.release();
}

exports.creatUser = async function(user, username, password) {
    const sqlQuery = "INSERT INTO users (username, password) VALUES(?, ?)";
    const db = await user.getConnection();
    await db.query(sqlQuery, [username, password]);
    db.release();
}

/***********************************************************
 * Edit
 ***********************************************************/

// Edits a client entry
exports.editClient = async function(user, id, name, company, telephone, mobile, email, street, suburb, city, pc) {
    const db = await user.getConnection();
    const sqlQuery = "UPDATE clients SET name=?, company=?, home=?, mobile=?, email=?, street=?, suburb=?, city=?, postcode=? WHERE id=?";
    await db.query(sqlQuery, [name, company, telephone, mobile, email, street, suburb, city, pc, id]);
    db.release();
}

// Edits a reminder entry
exports.editReminder = async function(user, id, date) {
    const sqlQuery = "UPDATE reminders SET rDate=? WHERE id=?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [date, id]);
    db.release();
}

// Edit a reminder entry for a given client id
exports.editClientReminder = async function(user, id, date, status) {
    const sqlQuery = "UPDATE reminders SET rDate=?, status=? WHERE client_id=?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [date, status, id]);
    db.release();
}

// Sets a reminder status
exports.setReminderStatus = async function(user, status, outcome, id) {
    const sqlQuery = "UPDATE reminders SET status=?, outcome=? WHERE id=?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [status, outcome, id]);
    db.release();
}

exports.setReminderFlag = async function(user, id, value) {
    const sqlQuery = "UPDATE reminders SET flag=? WHERE id=?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [value, id]);
    db.release();
}

// Edits a comment entry
exports.editNote = async function(user, id, text) {
    if (text.length < 1) {
        text = null;
    }
    const sqlQuery = "UPDATE notes SET note=? WHERE id=?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [text, id]);
    db.release();
}

/***********************************************************
 * Delete
 ***********************************************************/
exports.deleteClient = async function(user, id) {
    sqlQuery = "DELETE FROM reminders WHERE client_id=" + id;
    const db = await user.getConnection();
    await db.query(sqlQuery);

    sqlQuery = "DELETE FROM interactions WHERE client_id=" + id;
    await db.query(sqlQuery);

    sqlQuery = "DELETE FROM notes WHERE client_id=" + id;
    await db.query(sqlQuery);

    sqlQuery = "DELETE FROM clients WHERE id=" + id;
    await db.query(sqlQuery);
    db.release();
}

exports.deleteNote = async function(user, id) {
    const sqlQuery = "DELETE FROM notes WHERE id=?";
    const db = await user.getConnection();
    await db.query(sqlQuery, id);
    db.release();
}

exports.deleteClientReminder = async function(user, id) {
    const sqlQuery = "DELETE FROM reminders WHERE client_id=?";
    const db = await user.getConnection();
    await db.query(sqlQuery, id);
    db.release();
}

exports.deleteUser = async function(user, id) {
    const sqlQuery = "DELETE FROM users WHERE id=?";
    const db = await user.getConnection();
    await db.query(sqlQuery, id);
    db.release();
}