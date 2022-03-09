//const express = require("express");
const db = require("./../database");

/***********************************************************
 * Retrieval
 ***********************************************************/

// Fetches the first x call dates from database and the associated 
// client details (clients table)
exports.callList = async function () {
    // for now do all call dates
    // Change to only grab from clients table? dont need call dates just yet
    const sqlQuery = "SELECT client_id, name FROM reminders LEFT JOIN clients ON clients.id = reminders.client_id";
    const rows = await db.query(sqlQuery);
    return rows;
};

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

/***********************************************************
 * Creation
 ***********************************************************/

// Creates a client entry
// Returns the id of the created client
exports.createClient = async function(name, comments) {
    let sqlQuery;
    let params = [name];

    // Only enter comments if something is entered
    // Input lenght from text area is 1 when nothing is entered
    if (comments.length > 1) {
        sqlQuery = "INSERT INTO clients (name, comments) VALUES(?, ?)";
        params.push(comments);
    } else {
        sqlQuery = "INSERT INTO clients (name) VALUES(?)";
    }
    await db.query(sqlQuery, params);

    return await getClientId(name);
}

// Creates a contact entry
exports.createContact = async function(name, phone, email, cNum, id) {
    let params = [name, phone, email, cNum, id];
    const sqlQuery = "INSERT INTO contacts (name, phone, email, clientNumber, client_id) VALUES(?, ?, ?, ?, ?)";
    await db.query(sqlQuery, params);
}

// Creates a reminder entry
exports.createReminder = async function(rDate, id) {
    const sqlQuery = "INSERT INTO reminders (rDate, client_id) VALUES(?, ?)";
    await db.query(sqlQuery, [rDate, id]);
}

// Creates an address entry
exports.createAddress = async function(street, suburb, city, pc, area, fa, clientAddress, id) {
    const params = [street, suburb, city, pc, area, fa, clientAddress, id];
    const sqlQuery = "INSERT INTO addresses (street, suburb, city, pc, area, fa, clientAddress, client_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
    await db.query(sqlQuery, params);
}

/***********************************************************
 * Helper functions
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