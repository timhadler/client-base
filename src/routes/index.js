const express = require("express");
const router = express.Router();
const clients = require("./../models/client-models");
//const globals = require("./../globals");

global.CLIENT_LIST = [];
global.TBC_LIST = [];
global.CONFIRMED_LIST = [];

global.SEARCH_LIST = [];
global.SEARCH = "";

global.D1 = getDate(0);
global.D2 = getDate(31);

router.get("/", async (req, res) => {
    try {
        CLIENT_LIST = await clients.callList(D1, D2);
        TBC_LIST = await clients.TBCList();
        CONFIRMED_LIST = await clients.confirmedList();

        res.render("index");
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

router.get("/setDates", (req, res) => {
    D1 = req.query.date1;
    D2 = req.query.date2;
    res.redirect("/");
})


// Gets the date n days from the current date (yyyy-mm-dd)
function getDate(n) {
    let date = new Date();
    date.setDate(date.getDate() + n);
    date = date.toISOString().slice(0, 10).replace('T', ' ');

    return date;
}

module.exports = router;