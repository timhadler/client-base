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
        // const addressDetails = await clients.clientDetails(req.params.id);
        // let callDetails = await clients.callDetails(req.params.id);
        let details = await clients.clientDetails(req.params.id);
        for (let i = 0; i < details.calls.length; i++) {
            details.calls[i].rDate = details.calls[i].rDate.toLocaleDateString();
        }

        res.status(200).render("client-details.ejs", {callList:callList, details:details});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/", (req, res) => {
    res.send("list");
});

router.delete("/:id", (req, res) => {
    res.send("Delete me");
})

module.exports = router;