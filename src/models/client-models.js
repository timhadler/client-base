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


// exports.callList = async function () {
//     try {
//         const sqlQuery = "SELECT * from Clients";
//         const rows = await db.query(sqlQuery);
//         return rows;
//     } catch (error) {
//         console.error(error.message);
//         throw error;
//     }
// };