//const express = require("express");
const db = require("./../database");

exports.callList = async function () {
    try {
        const sqlQuery = "SELECT * from Clients";
        const rows = await db.query(sqlQuery);
        return rows;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};