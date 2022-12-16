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

// Fetches the first 50 clients alphabetically from database
exports.clientList = async function() {
    const sqlQuery = "SELECT name, id FROM clients ORDER BY NAME LIMIT 50";
    const rows = await db.query(sqlQuery);

    return rows;
};

// Fetches the client details associated with the reminder dates between d1 and d2 and have status of "call"
exports.callList = async function (d1, d2) {
    const sqlQuery = "SELECT name, clients.id, comments, rDate, flag, reminders.id AS rId, reminders.status FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE reminders.status='call' AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY rDate";
    const rows = await db.query(sqlQuery);

    //console.log(rows[0]);
    return rows;
};

// Fetches the client details associated with the reminder dates between d1 and d2 and have status "tbc"
exports.TBCList = async function (d1, d2) {
    const sqlQuery = "SELECT name, clients.id, comments, rDate, flag, reminders.id AS rId, reminders.status FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE reminders.status='tbc' AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY rDate";
    const rows = await db.query(sqlQuery);

    //console.log(rows[0]);
    return rows;
};

// Fetches all clients with reminders statuses "confirmed"
exports.confirmedList = async function () {
    const sqlQuery = "SELECT name, clients.id, comments, rDate, reminders.id AS rId, reminders.status FROM clients INNER JOIN reminders ON clients.id = reminders.client_id WHERE reminders.status='confirmed' ORDER BY name";
    const rows = await db.query(sqlQuery);

    //console.log(rows[0]);
    return rows;
};

// Fetches clients resulting from a search query
exports.searchList = async function(search) {
    const sqlQuery = "SELECT name, id FROM clients WHERE name LIKE '%" + search + "%'";
    const rows = await db.query(sqlQuery, search);

    return rows;
}

// Fetches all entries from all tables associated with a given client id
// as an object -- {client, addresses, callDates, contacts, comments, services}
exports.clientDetails = async function(id) {
    const cli = await customerDetails(id);
    const add = await addressDetails(id);
    const call = await callDetails(id);
    const cont = await contactDetails(id);

    return {client: cli, addresses: add, calls:call, contacts:cont};
}

// Retrieves address with given id
exports.address = async function(id) {
    const sqlQuery = "SELECT * FROM addresses WHERE id=?";
    const rows = await db.query(sqlQuery, id);

    if (rows.length > 1) {
        console.log("Somethings gone wrong, fetched multiple addresses with same address id");
    }

    return rows[0];
}

// Retrieves contact with given id
exports.contact = async function(id) {
    const sqlQuery = "SELECT * FROM contacts WHERE id=?";
    const rows = await db.query(sqlQuery, id);

    if (rows.length > 1) {
        console.log("Somethings gone wrong, fetched multiple contacts with same contact id");
    }

    return rows[0];
}

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

// Reveives a client with a given name
exports.getClientByName = async function(name) {
    const sqlQuery = "SELECT * from clients WHERE name=?";
    const rows = await db.query(sqlQuery, name);

    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    };
}

/***********************************************************
 * Creation
 ***********************************************************/

// Creates a client entry
// Returns the id of the created client
exports.createClient = async function(name, company, comments) {
    let sqlQuery;
    let params = processParameters([name, company]);

    // Only enter comments if something is entered
    // Input lenght from text area is 1 when nothing is entered
    if (comments.length > 1) {
        sqlQuery = "INSERT INTO clients (name, company, comments) VALUES(?, ?, ?)";
        params.push(comments);
    } else {
        sqlQuery = "INSERT INTO clients (name, company) VALUES(?, ?)";
    }
    await db.query(sqlQuery, params);

    return await getClientId(name);
}

// Creates a contact entry
exports.createContact = async function(name, phone, email, id) {
    let params = processParameters([name, phone, email, id]);
    const sqlQuery = "INSERT INTO contacts (name, phone, email, client_id) VALUES(?, ?, ?, ?)";
    await db.query(sqlQuery, params);
}

// Creates a reminder entry
exports.createReminder = async function(rDate, id) {
    const sqlQuery = "INSERT INTO reminders (rDate, client_id) VALUES(?, ?)";
    await db.query(sqlQuery, [rDate, id]);
}

// Creates an address entry
exports.createAddress = async function(street, suburb, city, pc, fa, clientAddress, id) {
    if (street.length > 0) {
        const params = processParameters([street, suburb, city, pc, fa, clientAddress, id]);
        const sqlQuery = "INSERT INTO addresses (street, suburb, city, pc, fa, clientAddress, client_id) VALUES(?, ?, ?, ?, ?, ?, ?)";
        await db.query(sqlQuery, params);
    }
}

exports.creatUser = async function(username, password) {
    const sqlQuery = "INSERT INTO users (username, password) VALUES(?, ?)";
    const rows = await db.query(sqlQuery, [username, password]);
}

/***********************************************************
 * Edit
 ***********************************************************/

// Edits a client entry
exports.editClient = async function(id, name, company, comments) {
    // Comments are null if textarea length == 1
    if (comments.length <= 1) {
        comments = null;
    }
    const sqlQuery = "UPDATE clients SET name=?, company=?, comments=? WHERE id=?";
    await db.query(sqlQuery, [name, company, comments, id]);
}

// Edits an address entry
exports.editAddress = async function(id, street, suburb, city, pc, fa, clientAddress) {
    const params = [street, suburb, city, pc, fa, clientAddress, id];
    const sqlQuery = "UPDATE addresses SET street=?, suburb=?, city=?, pc=?, fa=?, clientAddress=? WHERE id=?";
    await db.query(sqlQuery, params);
}

// Edits a contact entry
exports.editContact = async function(id, name, phone, email) {
    const sqlQuery = "UPDATE contacts SET name=?, phone=?, email=? WHERE id=?";
    await db.query(sqlQuery, [name, phone, email, id]);
}

// Edits a reminder entry
exports.editReminder = async function(id, date) {
    const sqlQuery = "UPDATE reminders SET rDate=? WHERE id=?";
    await db.query(sqlQuery, [date, id]);
}

// Edits a comment entry
exports.editComment = async function(id, text) {
    if (text.length < 1) {
        text = null;
    }
    const sqlQuery = "UPDATE clients SET comments=? WHERE id=?";
    await db.query(sqlQuery, [text, id]);
}

// Sets client status
exports.setClientStatus = async function(status, id) {
    const sqlQuery = "UPDATE reminders SET STATUS=? WHERE id=?";
    await db.query(sqlQuery, [status, id]);
}

exports.setReminderFlag = async function(id, value) {
    const sqlQuery = "UPDATE reminders SET flag=? WHERE id=?";
    await db.query(sqlQuery, [value, id]);
}

// Clear all clients with status confirmed to status call
exports.resetConfirmedList = async function() {
    const sqlQuery = "UPDATE reminders SET STATUS='call', flag=? WHERE STATUS='confirmed'";
    await db.query(sqlQuery, null);
}


/***********************************************************
 * Delete
 ***********************************************************/
exports.deleteClientData = async function(id) {
    var sqlQuery = "DELETE FROM addresses WHERE client_id=" + id;
    await db.query(sqlQuery);

    sqlQuery = "DELETE FROM contacts WHERE client_id=" + id;
    await db.query(sqlQuery);

    sqlQuery = "DELETE FROM reminders WHERE client_id=" + id;
    await db.query(sqlQuery);

    sqlQuery = "DELETE FROM clients WHERE id=" + id;
    await db.query(sqlQuery);
}

exports.deleteAddress = async function(id) {
    const sqlQuery = "DELETE FROM addresses WHERE id=?";
    await db.query(sqlQuery, id);
}

exports.deleteReminder = async function(id) {
    const sqlQuery = "DELETE FROM reminders WHERE id=?";
    await db.query(sqlQuery, id);
}

exports.deleteContact = async function(id) {
    const sqlQuery = "DELETE FROM contacts WHERE id=?";
    await db.query(sqlQuery, id);
}

exports.deleteUser = async function(id) {
    const sqlQuery = "DELETE FROM users WHERE id=?";
    await db.query(sqlQuery, id);
}

/***********************************************************
 * Helper functions - DATABASE
 ***********************************************************/
// Returns the id of a given client name
async function getClientId(name) {
    const sqlQuery = "SELECT id FROM clients WHERE name=?";
    const rows = await db.query(sqlQuery, name);
    if (rows.length > 1) {
        console.log("Carefull multiple clients with name: " + name);
    }
    return rows[rows.length - 1].id;
};

// Fetches the address details of a given client_id
async function addressDetails(id) {
    const sqlQuery = "SELECT * from addresses WHERE client_id=" + id;
    const rows = await db.query(sqlQuery);

    return rows;
}

// Fetches the call dates of a given client_id
async function callDetails(id) {
    const sqlQuery = "SELECT * from reminders WHERE client_id=" + id;
    const rows = await db.query(sqlQuery);

    return rows;
}

// Fetches all the contacts of a given client_id
async function contactDetails(id) {
        const sqlQuery = "SELECT * FROM contacts WHERE contacts.client_id=" + id;
        rows = await db.query(sqlQuery);

        return rows;
}

// Fetches all the client details of a given client_id
async function customerDetails(id) {
    const sqlQuery = "SELECT * FROM clients WHERE clients.id=" + id;
    rows = await db.query(sqlQuery);
    return rows[0];
}

// OTHER
// Turns parameters in a list to null if their length is 0
function processParameters(list) {
    var result = list;
    for (let i = 0; i < result.length; i++) {
        if (result[i].length <= 0) {
            result[i] = null;
        }
    }
    return result;
}