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

        res.status(200).render("clientOverview/overview", {nClients:nClients, list:list});
    } catch (error) {
        res.status(500).send(error.message);
    }
})

module.exports = router;