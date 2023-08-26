//const express = require("express");
const db = require("./../database");

/***********************************************************
 * Retrieval
 ***********************************************************/
// Get number of clients in database
exports.clientNumber = async function() {
    const sqlQuery = "SELECT COUNT(*) as n FROM clients";
    const rows = await db.query(sqlQuery);

    return rows[0].n;
};

// Fetches the first x clients alphabetically from database
// If x is null, returns all clients in alphabetical order
exports.clientList = async function(limit, offset) {
    const sqlQuery = "SELECT name, id FROM clients ORDER BY NAME LIMIT " + limit + " OFFSET " + offset;
    const rows = await db.query(sqlQuery);

    return rows;
};

// Fetches the client details associated with the reminder dates between d1 and d2 and have status of "pending"
exports.pendingList = async function (d1, d2, limit, offset, order) {
    const sqlQuery = "SELECT COUNT(*) over() as n, clients.id, name, mobile, rDate, flag, reminders.id AS rId, reminders.status FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE reminders.status='pending' AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY " + order + " LIMIT " + limit + " OFFSET " + offset;
    const rows = await db.query(sqlQuery);

    return rows;
};

// Fetches the client details associated with the reminder dates between d1 and d2 and have status "noResponse" or "followUp"
exports.followUpList1 = async function (d1, d2, limit, offset, order) {
    const sqlQuery = "SELECT COUNT(*) over() as n, name, clients.id, rDate, flag, reminders.id AS rId, reminders.status FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE status IN ('followUp', 'noResponse') AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY " + order + " LIMIT " + limit + " OFFSET " + offset;
    const rows = await db.query(sqlQuery);

    return rows;
};

// Fetches the client details associated with the reminder dates between d1 and d2 and have status "followUp"
exports.followUpList2 = async function (d1, d2, limit, offset, order) {
    const sqlQuery = "SELECT COUNT(*) over() as n, name, clients.id, rDate, flag, reminders.id AS rId, reminders.status FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE status='followUp' AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY " + order + " LIMIT " + limit + " OFFSET " + offset;
    const rows = await db.query(sqlQuery);

    return rows;
};

// Fetches the client details associated with the reminder dates between d1 and d2 and have status "noResponse"
exports.followUpList3 = async function (d1, d2, limit, offset, order) {
    const sqlQuery = "SELECT COUNT(*) over() as n, name, clients.id, rDate, flag, reminders.id AS rId, reminders.status FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE status='noResponse' AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY " + order + " LIMIT " + limit + " OFFSET " + offset;
    const rows = await db.query(sqlQuery);

    return rows;
};

// Fetches the client details associated with reminders that have status "awaitingResponse"
exports.awaitingList = async function (d1, d2, limit, offset, order) {
    let sqlQuery = "SELECT COUNT(*) over() as n, name, clients.id, rDate, flag, reminders.id AS rId, reminders.status, latest_created FROM clients INNER JOIN reminders ON clients.id = reminders.client_id ";
    if (1) {
        sqlQuery += "LEFT JOIN (SELECT reminder_id, MAX(created) AS latest_created FROM interactions GROUP BY reminder_id) latest_int ON reminders.id = latest_int.reminder_id LEFT JOIN interactions ON reminders.id = interactions.reminder_id AND latest_int.latest_created = interactions.created ";
        //order = "latest_created"
    }
    sqlQuery += "WHERE reminders.status='awaiting' AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY " + order + " LIMIT " + limit + " OFFSET " + offset;
    let rows = await db.query(sqlQuery);

    return rows;
};

// Fetches all clients with reminders statuses "completed"
exports.completedList = async function () {
    const sqlQuery = "SELECT name, clients.id, rDate, reminders.id AS rId, reminders.status, outcome FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE reminders.status='completed' ORDER BY name";
    const rows = await db.query(sqlQuery);

    return rows;
};

// Fetches all interactions associated with a given reminder
exports.reminderInteractions = async function(id) {
    const sqlQuery = "SELECT interaction, created FROM interactions WHERE reminder_id=" + id + " ORDER BY created DESC";
    const rows = await db.query(sqlQuery);

    return rows;
}

// Fethes all notes related to a client with a given id
exports.clientNotes = async function(id) {
    const sqlQuery = "SELECT id, note, created FROM notes WHERE client_id = " + id + " ORDER BY created DESC";
    const rows = await db.query(sqlQuery);

    return rows;
}

// Fetches clients resulting from a search query
exports.searchList = async function(search) {
    const sqlQuery = "SELECT COUNT(*) over() as n, name, id FROM clients WHERE name LIKE '%" + search + "%'";
    const rows = await db.query(sqlQuery, search);

    return rows;
}

// Fetches client details with a given id
exports.clientDetails = async function(id) {
    const sqlQuery = "SELECT * FROM clients WHERE clients.id=" + id;
    rows = await db.query(sqlQuery);
    return rows[0];
}

// Retrieves the reminder associated with a client id
exports.clientReminder = async function(id) {
    const sqlQuery = "SELECT * from reminders WHERE client_id=? AND status IN ('pending', 'awaiting', 'followUP')";
    const rows = await db.query(sqlQuery, id);

    // Should only be 1 active reminder
    if (rows.length > 1) {
        console.log("Possible bug: more than 1 active reminder for client (id=" + id + ")");
    }

    return rows[0];
}

// For automatically moving clients out of awaiting list into followUp list, not unsing currently
// // Retrieves the reminders with status awaiting and their latest interaction date
// exports.awaitingReminders = async function() {
//     const sqlQuery = "SELECT reminders.id, latest_interaction.created AS latest_interaction_date FROM reminders INNER JOIN interactions AS latest_interaction ON reminders.id = latest_interaction.reminder_id AND latest_interaction.created = ( SELECT MAX(created) FROM interactions WHERE reminder_id = reminders.id ) WHERE reminders.status = 'awaiting';"
//     const rows = await db.query(sqlQuery);

//     return rows;
// }
//
// // Retireves the user settings for the timeframe for when a reminder status is changed form awaiting to noResponse
// exports.settingResponseTimeFrame = async function() {
//     const sqlQuery = "SELECT setting_value FROM settings WHERE setting_key='response_timeframe'";
//     const rows = await db.query(sqlQuery);

//     return rows[0].setting_value;
// }

// Reveives a user with a given id
exports.getUserById = async function(id) {
    const sqlQuery = "SELECT * from users WHERE id=?";
    const rows = await db.query(sqlQuery, id);

    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    };
}

// Reveives a user with a given username
exports.getUserByUsername = async function(username) {
    const sqlQuery = "SELECT * from users WHERE username=?";
    const rows = await db.query(sqlQuery, username);

    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    };
}

// Returns a list of all clients in db with the provided name
exports.getClientsByName = async function(name) {
    const sqlQuery = "SELECT * from clients WHERE name=?";
    const rows = await db.query(sqlQuery, name);
    return rows;
}

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

// Creates a note entry
exports.createNote = async function(note, id) {
    const sqlQuery = "INSERT INTO notes (note, client_id) VALUES(?, ?)";
    await db.query(sqlQuery, [note, id]);
}

exports.creatUser = async function(username, password) {
    const sqlQuery = "INSERT INTO users (username, password) VALUES(?, ?)";
    const rows = await db.query(sqlQuery, [username, password]);
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

// Sets a reminder status
exports.setReminderStatus = async function(status, outcome, id) {
    const sqlQuery = "UPDATE reminders SET status=?, outcome=? WHERE id=?";
    await db.query(sqlQuery, [status, outcome, id]);
}

exports.setReminderFlag = async function(id, value) {
    const sqlQuery = "UPDATE reminders SET flag=? WHERE id=?";
    await db.query(sqlQuery, [value, id]);
}

// Edits a comment entry
exports.editNote = async function(id, text) {
    if (text.length < 1) {
        text = null;
    }
    const sqlQuery = "UPDATE notes SET note=? WHERE id=?";
    await db.query(sqlQuery, [text, id]);
}

/***********************************************************
 * Delete
 ***********************************************************/
exports.deleteClient = async function(id) {
    sqlQuery = "DELETE FROM reminders WHERE client_id=" + id;
    await db.query(sqlQuery);

    sqlQuery = "DELETE FROM interactions WHERE client_id=" + id;
    await db.query(sqlQuery);

    sqlQuery = "DELETE FROM notes WHERE client_id=" + id;
    await db.query(sqlQuery);

    sqlQuery = "DELETE FROM clients WHERE id=" + id;
    await db.query(sqlQuery);
}

exports.deleteNote = async function(id) {
    const sqlQuery = "DELETE FROM notes WHERE id=?";
    await db.query(sqlQuery, id);
}

exports.deleteClientReminder = async function(id) {
    const sqlQuery = "DELETE FROM reminders WHERE client_id=?";
    await db.query(sqlQuery, id);
}

exports.deleteUser = async function(id) {
    const sqlQuery = "DELETE FROM users WHERE id=?";
    await db.query(sqlQuery, id);
}