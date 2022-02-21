const express = require("express");
const router = express.Router();
const clients = require("./../models/client-models");

router.get("/", async (req, res) => {
    let callList = await clients.callList();
    //let toBeConfirmed = await clients.toBeConfirmedList
    //let confirmed = await clients.confiemedList
    //let callList = [{id:5, name:"Tim"}];
    res.render("index", {callList: callList});
});

module.exports = router;