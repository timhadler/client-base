//const express = require("express");
const db = require("./../database");

/***********************************************************
 * Retrieval
 ***********************************************************/

// Fetches the client names associated with the reminder dates between d1 and d2
// client details (clients table)
exports.callList = async function (d1, d2) {
    const sqlQuery = "SELECT name, clients.id FROM clients INNER JOIN reminders ON clients.id = reminders.client_id AND rDate BETWEEN '" + d1 + "' AND '" + d2 + "' ORDER BY rDate";
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

/***********************************************************
 * Creation
 ***********************************************************/

// Creates a client entry
// Returns the id of the created client
exports.createClient = async function(name, company, comments) {
    let sqlQuery;
    let params = [name, company];

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
    let params = [name, phone, email, id];
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
    const params = [street, suburb, city, pc, fa, clientAddress, id];
    const sqlQuery = "INSERT INTO addresses (street, suburb, city, pc, fa, clientAddress, client_id) VALUES(?, ?, ?, ?, ?, ?, ?)";
    await db.query(sqlQuery, params);
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

/***********************************************************
 * Delete
 ***********************************************************/
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