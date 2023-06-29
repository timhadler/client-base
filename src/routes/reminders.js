const express = require("express");
const router = express.Router();
const clients = require("../models/client-models");   

// Get the dates that define the current month
global.D1 = getDate(0).slice(0, 8) + "01"
global.D2 = D1.slice(0, 8) + getLastDate(D1.slice(5, 7));
global.MONTH = D1.slice(0, 7);
global.LIMIT_P = 25;
global.LIMIT_FU = 25;
const LIMIT_ADD = 25;

router.get("/", async (req, res) => {
    try {
        res.status(200).render("reminders/reminders", {month:MONTH, d1:D1, d2:D2});
    } catch (error) {
        res.status(500).send();
    }
});

// Get a given reminder list from database
router.get("/load-reminder-list", async (req, res) => {
    try {
        var list = req.query.list;
        var data = [];

        switch (list) {
            case "pendingList":
              data = await clients.pendingList(D1, D2, LIMIT_P);
              break;
            case "followUpList":
              data = await clients.followUpList(D1, D2, LIMIT_FU);
              break;
            case "awaitingList":
              data = await clients.awaitingList();
              break;
            case "completedList":
              data = await clients.completedList();
              break;
          }
        res.json(JSON.stringify(data));
    } catch (error) {
        res.status(500).send();
    }
});

// Set the date range for the call and tbc list
router.get("/setDates", async (req, res) => {
    try {
        // If req came from month date form
        if (req.query.monthCL) {
            const month = req.query.monthCL;

            // Get the dates that define the selected month
            D1 = month + "-01";
            D2 = month + "-" + getLastDate(D1.slice(5, 7));
            MONTH = D1.slice(0, 7);
            res.status(200).redirect("/");
        } else {    // else the req comes from a custom date range form
            D1 = req.query.date1;
            D2 = req.query.date2;
            MONTH = "custom";
            res.status(200).redirect("/");
        }
    } catch (error) {
        res.status(500).send();
    }
});

// POST set client status, AJAX
router.post("/set-reminder-status", async (req, res) => {
    try {
        const formData = req.body.data;     // formData in form of query string from AJAX request
        const rId = req.body.id;
        const params = new URLSearchParams(formData);
        const note = params.get('note');
        let action = params.get('action');
        let outcome = params.get('outcome');

        //console.log(note)
        let status = null;
        if (action) {
            if (action == "ignore") {
                status = "completed";
                outcome = null;         // no outcome if ignored
            }
            if (outcome == "noAns") {
                action += " - no answer";
            }
            await clients.createInteraction(action, rId);
        }
        if (outcome) {
            if (outcome == "followUp") {
                status = "followUp";
                // Change rDate
            } else if (outcome == "booked") {
                status = "completed";
                // Open booking window
            } else if (outcome == "declined") {
                status = "completed";
            }
        }
        if (!status && action) {
            status = "awaiting";
        }
        if (!outcome) {outcome = null};
        if (status) {
            await clients.setReminderStatus(status, outcome, rId);
        }
        console.log(rId);

        // Add note if one is provided
        if (note) {
            await clients.createNote(note, rId);
        }
        // Change rDate
        /*
        if (req.body.rDate && (req.body.clientStatus == "confirmed" || req.body.clientStatus == "call")) {
            await clients.editReminder(req.params.rId, req.body.rDate);
        }
        */

        // Set flag/urgent and comments
        /*
        let value = 0;
        if (req.body.flagStatus == "flagged") { value = 1; } else {value = null};
        await clients.setReminderFlag(req.params.rId, value);
        await clients.editComment(req.params.id, req.body.comments);
        */
        
        res.status(201).redirect("/");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST set multiple client statuses using checkboxes
router.post("/set-client-status-multi", async (req, res) => {
    try {
        var rIds = req.body["selectedClients"];
        console.log(rIds)

        // if (typeof rIds == "string") {       // If only one client has been selected, rIds will be a string, list of rIds if more than one
        //     rIds = [rIds];
        // } else if (typeof rIds == 'undefined') {
        //     rIds = [];
        // }
        // if (req.body.clientStatus) {
        //     if (req.body.incrementYear == 'incrementYear') {
        //         // Increment year for all clients
        //         for (let i = 0; i < rIds.length; i++) {
        //             let rDate = await clients.reminder(rIds[i]);
        //             let nYear = 0;

        //             rDate = rDate.rDate.toLocaleDateString('en-GB');
        //             nYear = parseInt(rDate.slice(6)) + 1;
        //             rDate = nYear.toString() + "-" + rDate.slice(3, 5) + "-" + rDate.slice(0, 2);

        //             await clients.editReminder(rIds[i], rDate);
        //         }
        //     }
        //     // Set clients status
        //     for (let i = 0; i < rIds.length; i++) {
        //         await clients.setClientStatus(req.body.clientStatus, rIds[i]);
        //     }
        // }

        res.status(201).redirect("/");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Load more reminders of status pending
router.get("/load-more-:limit", (req, res) => {
    try {
        if (req.params.limit == "p") {
            LIMIT_P += LIMIT_ADD;
        } else if (req.params.limit == "fu") {
            LIMIT_FU += LIMIT_ADD;
        }
        res.redirect("/");
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