const express = require("express");
const router = express.Router();
const clients = require("./../models/client-models");
const globals = require("./../globals");

router.get("/", async (req, res) => {
    try {
        console.log(globals.d1);
        let callList = await clients.callList(globals.d1, globals.d2);
        res.render("index", {callList: callList});
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

module.exports = router;