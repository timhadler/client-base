const express = require("express");
const router = express.Router();
const clients = require("./../models/client-models");

//global.CLIENT_LIST = [];        // all clients with reminder dates inbetween D1 and D2 with status of "call"
//global.TBC_LIST = [];           // all clients associated with reminder dates with status of "tbc"           
//global.CONFIRMED_LIST = [];     // all clients associated with reminder dates with status of "confirmed"    

// Get the dates that define the current month
global.D1 = getDate(0).slice(0, 8) + "01"
global.D2 = D1.slice(0, 8) + getLastDate(D1.slice(5, 7));

router.get("/", async (req, res) => {
    try {
        // CLIENT_LIST = await clients.callList(D1, D2);
        // TBC_LIST = await clients.TBCList(D1, D2);
        // CONFIRMED_LIST = await clients.confirmedList();

        const callList = await clients.callList(D1, D2);
        const tbcList = await clients.TBCList(D1, D2);
        const confirmedList = await clients.confirmedList();

        res.status(200).render("callList/callList", {month:D1.slice(0, 7), callList:callList, tbcList:tbcList, confirmedList:confirmedList});
    } catch (error) {
        res.status(500).send();
    }
});

// Set the date range for the call and tbc list
router.get("/setDates", async (req, res) => {
    try {
    // D1 = req.query.date1;
    // D2 = req.query.date2;
    const month = req.query.monthCL;

    // Get the dates that define the selected month
    D1 = month + "-01"
    D2 = month + "-" + getLastDate(D1.slice(5, 7));
    res.status(200).redirect("/");

    // const callList = await clients.callList(d1, d2);
    // const tbcList = await clients.TBCList(d1, d2);
    // const confirmedList = await clients.confirmedList();

    // res.status(200).render("callList/callList", {month:month, callList:callList, tbcList:tbcList, confirmedList:confirmedList});
    //res.redirect("/?month=" + month);
    } catch (error) {
        res.status(500).send();
    }
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

// Gets the date n days from the current date (output: yyyy-mm-dd)
function getDate(n) {
    let date = new Date();
    date.setDate(date.getDate() + n);
    date = date.toISOString().slice(0, 10).replace('T', ' ');

    return date;
};

// Returns string of the last date in a given month
// Input: "12", Output: "31"
function getLastDate(m) {
    let d = "31"

    switch(m) {
        case ("02"):
            d = "28";
            break;
        case ("04"):
            d = "30";
            break;
        case ("06"):
            d = "30";
            break;
        case ("09"):
            d = "30";
            break;
        case ("11"):
            d = "30";
            break
    }
    return d;
}

module.exports = router;