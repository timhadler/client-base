const express = require("express");
const router = express.Router();
const clients = require("./../models/client-models");

router.get("/", async (req, res) => {
    try {
        let callList = await clients.callList();
        res.render("index", {callList: callList});
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

module.exports = router;