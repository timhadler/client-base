const express = require("express");
const router = express.Router();
const clients = require("./../models/client-models");
const globals = require("./../globals");

global.CLIENT_LIST = [];
global.SEARCH = "";
let started = 0;

router.get("/", async (req, res) => {
    try {
        if (!started) {
            CLIENT_LIST = await clients.callList(globals.d1, globals.d2);
            started = 1;
        }
        res.render("index", {list: CLIENT_LIST});
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

module.exports = router;