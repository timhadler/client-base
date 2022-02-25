//const express = require("express");
const db = require("./../database");

// Fetches the first x call dates from databse and the associated 
// client details (clients table)
exports.callList = async function () {
    try {
        // for now do all call dates
        const sqlQuery = "SELECT client_id, name FROM reminders LEFT JOIN clients ON clients.id = reminders.client_id";
        const rows = await db.query(sqlQuery);
        return rows;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

// Fetches all entries from all tables associated with a given client id
// as an object -- {client, cAddresses, cCallDates, cContacts, cComments, cServices}
exports.clientDetails = async function(id) {
    try {
        //sqlQuery = "";
        //const rows = await db.query(sqlQuery);
        const cli = await customerDetails(id);
        const add = await addressDetails(id);
        const call = await callDetails(id);
        const cont = await contactDetails(id);

        return {client: cli, addresses: add, calls:call, contacts:cont};
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// Fetches the address details of a given client_id
async function addressDetails(id) {
    try {
        const sqlQuery = "SELECT * from addresses WHERE client_id=" + id;
        const rows = await db.query(sqlQuery);

        return rows;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// Fetches the call dates of a given client_id
async function callDetails(id) {
    try {
        const sqlQuery = "SELECT * from reminders WHERE client_id=" + id;
        const rows = await db.query(sqlQuery);
        //console.log(sqlQuery);
        //console.log(rows[0]);
        return rows;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// Fetches all the contacts of a given client_id
async function contactDetails(id) {
    try {
        const sqlQuery = "SELECT * FROM contacts WHERE contacts.client_id=" + id;
        rows = await db.query(sqlQuery);
        return rows;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// Fetches all the client details of a given client_id
async function customerDetails(id) {
    try {
        const sqlQuery = "SELECT * FROM clients WHERE clients.id=" + id;
        rows = await db.query(sqlQuery);
        return rows[0];
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}