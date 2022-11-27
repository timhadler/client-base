const express = require("express");
const router = express.Router();
const clients = require("./../models/client-models");
//const globals = require("./../globals");

global.CLIENT_LIST = [];        // all clients with reminder dates inbetween D1 and D2, regardless of reminder status
global.TBC_LIST = [];           // all clients associated with reminder dates with status of "tbc"           
global.CONFIRMED_LIST = [];     // all clients associated with reminder dates with status of "confirmed"    

global.SEARCH_LIST = [];
global.SEARCH = "";             // This is the search query from the client-list search bar

global.D1 = getDate(0);
global.D2 = getDate(31);

router.get("/", async (req, res) => {
    try {
        CLIENT_LIST = await clients.callList(D1, D2);
        TBC_LIST = await clients.TBCList(D1, D2);
        CONFIRMED_LIST = await clients.confirmedList();

        res.render("callList/callList");
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