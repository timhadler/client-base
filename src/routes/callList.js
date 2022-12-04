const express = require("express");
const router = express.Router();
const clients = require("./../models/client-models");

global.CLIENT_LIST = [];        // all clients with reminder dates inbetween D1 and D2 with status of "call"
global.TBC_LIST = [];           // all clients associated with reminder dates with status of "tbc"           
global.CONFIRMED_LIST = [];     // all clients associated with reminder dates with status of "confirmed"    

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

// Set the date range for the call and tbc list
router.get("/setDates", (req, res) => {
    D1 = req.query.date1;
    D2 = req.query.date2;
    const month = req.query.monthCL;
    res.redirect("/?month=" + month);
});

// POST set client status
router.post("/set-client-status-:id-:rId", async (req, res) => {
    try {
        if (req.body.clientStatus) {
            await clients.setClientStatus(req.body.clientStatus, req.params.rId);
        }
        if (req.body.rDate && (req.body.clientStatus == "confirmed" || req.body.clientStatus == "call")) {
            await clients.editReminder(req.params.rId, req.body.rDate);
        }

        let value = 0;
        if (req.body.flagStatus == "flagged") { value = 1; } else {value = null};
        await clients.setReminderFlag(req.params.rId, value);
        await clients.editComment(req.params.id, req.body.comments);
        
        res.status(201).redirect("/");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST clear confirmed list
router.post("/reset-confirmed-list", async (req, res) => {
    try {
        await clients.resetConfirmedList();
        res.status(201).redirect("/");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Gets the date n days from the current date (yyyy-mm-dd)
function getDate(n) {
    let date = new Date();
    date.setDate(date.getDate() + n);
    date = date.toISOString().slice(0, 10).replace('T', ' ');

    return date;
};

module.exports = router;