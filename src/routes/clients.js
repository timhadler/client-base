//const { response } = require("express");
const express = require("express");
const router = express.Router();
const db = require("./../database");
const clients = require("./../models/client-models");

router.get("/:id", async (req, res) => {
    try {
        //const sqlQuery = "SELECT * from Clients WHERE id=?";
        //const rows = await db.query(sqlQuery, req.params.id);

        const callList = await clients.callList();
        const addressDetails = await clients.addressDetails(req.params.id);
        const callDetails = await clients.callDetails(req.params.id);

        res.status(200).render("client-details.ejs", {callList:callList, addDetails:addressDetails
                                                    , callDetails: callDetails});
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get("/", (req, res) => {
    res.send("list");
});

module.exports = router;