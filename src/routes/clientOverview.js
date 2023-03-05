const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const router = express.Router();
const clients = require("../models/client-models");
xl = require("../modules/excel-JS");
const multer = require('multer');                   // For uploading files
const upload = multer({ dest: "uploads/" });

router.get("/", async (req, res) => {
    try {
        const nClients = await clients.clientNumber();
        const list = await clients.clientList();

        res.status(200).render("clientOverview/overview", {nClients:nClients, list:list, message:req.query.message});
    } catch (error) {
        res.status(500).send(error.message);
    }
})

// Filter clients
router.post("/filter", async (req, res) => {
    try {
        const nClients = await clients.clientNumber();
        var list = [];

        if (typeof req.body.noRDate != "undefined") {
            list = await clients.getClientsNoRDate();
        } else {
            list = await clients.clientList();
        };

        res.status(200).render("clientOverview/overview", {nClients:nClients, list:list})
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Add given reminder to selected clients
router.post("/addReminderDate", async (req, res) => {
    try {
        const ids = req.body["selectedClients"];
        var message = "";

        if (typeof ids != "undefined" && req.body.rDate.length > 0) {
            if (typeof ids != "string") {       // If only one client has been selected, ids will be a string, object list if more than one
                for (let i in ids) {
                    await clients.createReminder(req.body.rDate, parseInt(ids[i]));
                    message = "Succesfully added reminder date for " + ids.length + " clients";
                }
            } else {
                await clients.createReminder(req.body.rDate, parseInt(ids));
                message = "Succesfully added reminder date for 1 client"
            }
        } else {
            message = "Missing clients or reminder date";
        }
        message = encodeURIComponent(message);
        res.status(200).redirect("/clientOverview/?message=" + message);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;