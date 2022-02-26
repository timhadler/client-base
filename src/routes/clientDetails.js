//const { response } = require("express");
const express = require("express");
const router = express.Router();
const db = require("./../database");
const clients = require("./../models/client-models");

router.get("/", (req, res) => {
    res.send("How did you get here?");
});

router.get("/add-client", async (req, res) => {
    try {
        const callList = await clients.callList();

        res.render("addClient/addCLient.ejs", {callList:callList});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post("/add-client", async (req, res) => {
    try {
        const body = req.body;
        if (body.name != "") {
            const sqlQuery = "INSERT INTO clients (name, comments) VALUES(?, ?)";
            db.query(sqlQuery, [body.name, body.comments]);

            const id = await clients.clientId(body.name);

            res.redirect("/clients/" + id);
        };
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post("/add-address", async (req, res) => {
    try {
        const body = req.body;
        res.send("Add address");
        // if (body.name != "") {
        //     const sqlQuery = "INSERT INTO clients (name, comments) VALUES(?, ?)";
        //     db.query(sqlQuery, [body.name, body.comments]);

        //     const id = await clients.clientId(body.name);

        //     res.redirect("/clients/" + id);
        // };
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const callList = await clients.callList();
        let details = await clients.clientDetails(req.params.id);
        //console.log(details);
        
        // Convert dates to a nicer format to display
        for (let i = 0; i < details.calls.length; i++) {
            details.calls[i].rDate = details.calls[i].rDate.toLocaleDateString();
        }

        if (details.client != null) {
            res.status(200).render("clientDetails/client-details.ejs", {callList:callList, details:details});
        } else {
            res.redirect("/");
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.delete("/:id", (req, res) => {
    res.send("Delete me");
});

module.exports = router;