const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const router = express.Router();
const clients = require("../models/client-models");
xl = require("../modules/excel-JS");
const multer = require('multer');                   // For uploading files
const upload = multer({ dest: "uploads/" });

// Filter parameters are passed as queries
router.get("/", async (req, res) => {
    try {
        const nClients = await clients.clientNumber();
        var list = [];

        if (typeof req.query.noRDate != "undefined") {
            list = await clients.getClientsNoRDate();
        } else {
            // Get all clients
            list = await clients.clientList(50, 0);
        };

        if (typeof req.query.search != 'undefined') {
            if (req.query.search.length > 0) {
                // If filter has been applied, search is applied to filtered list
                if (list.length > 0) {
                    var nList = [];
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].name.toLowerCase().includes(req.query.search.toLowerCase())) {
                            nList.push(list[i]);
                        }
                    }
                    list = nList;
                } else {
                    list = await clients.searchList(req.query.search);
                }
            }
        }
        res.locals.search = req.query.search;
        res.locals.noRDate = req.query.noRDate;
        res.status(200).render("clientOverview/overview", {nClients:nClients, list:list, message:req.query.message})
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

// Delete
router.delete("/delete", async (req, res) => {
    try {
        const ids = req.body["selectedClients"];
        var message = "";

        if (typeof ids != "undefined") {
            if (typeof ids != "string") {       // If only one client has been selected, ids will be a string, object list if more than one
                for (let i = 0; i < ids.length; i++) {
                    await clients.deleteClientData(ids[i]);
                    message = "Succesfully deleted " + ids.length + " clients";
                }
            } else {
                await clients.deleteClientData(ids);
                message = "Succesfully deleted 1 client";
            }
        }
        res.status(204).redirect("/clientOverview/?message=" + message);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;