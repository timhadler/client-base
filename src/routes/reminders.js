const express = require("express");
const router = express.Router();
const clients = require("../models/client-models");   

// Get the dates that define the current month for the pending list
global.D1_P = getDate(0).slice(0, 8) + "01"
global.D2_P = D1_P.slice(0, 8) + getLastDate(D1_P.slice(5, 7));
global.MONTH_P = D1_P.slice(0, 7);
global.ORDER_P = "rDate"
// Follow up lists starts with getting all followUp entries from db
global.D1_FU = "0001-01-01";
global.D2_FU = "9999-12-31";
global.MONTH_FU = MONTH_P;
global.ORDER_FU = "status"
// Awaiting list
global.D1_A = "0001-01-01";
global.D2_A = "9999-12-31";
global.MONTH_A = MONTH_P;
global.ORDER_A = "name"

router.get("/", async (req, res) => {
    try {
        // set awaiting statuses to no response if timeframe has passed
        const awaiting = await clients.awaitingReminders();
        const timeframeDays = await clients.settingResponseTimeFrame();

        for (let i = 0; i < awaiting.length; i++) {
            // Convert the latest_interaction_date to a JavaScript Date object, excluding time data (HH,MM,SS)
            let latestInteractionDate = new Date(awaiting[i].latest_interaction_date);
            latestInteractionDate = new Date(latestInteractionDate.getFullYear(), latestInteractionDate.getMonth(), latestInteractionDate.getDate());

            // Calculate the days passed since the lastInteractionDate
            const millisecondsPassed = Date.now() - latestInteractionDate;
            const daysPassed = Math.floor(millisecondsPassed / (1000 * 60 * 60 * 24));

            // If days passed exceeds timeframe, set reminder status to noResponse, outcome is null
            if (daysPassed >= timeframeDays) {
                await clients.setReminderStatus("noResponse", null, awaiting[i].id);
            }
        }
        res.status(200).render("reminders/reminders", {month_p:MONTH_P, month_fu:MONTH_FU, month_a:MONTH_A, d1_p:D1_P, d2_p:D2_P, d1_fu:D1_FU, d2_fu:D2_FU, d1_a:D1_A, d2_a:D2_A});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a given reminder list from database
router.get("/load-reminder-list", async (req, res) => {
    try {
        var list = req.query.list;
        var data = [];

        switch (list) {
            case "pendingList":
              data = await clients.pendingList(D1_P, D2_P, req.query.limit, req.query.offset, ORDER_P);
              break;
            case "followUpList":
              // Get the reminders with status followUp
              data = await clients.followUpList1(D1_FU, D2_FU, req.query.limit, req.query.offset, ORDER_FU);
              break;
            case "awaitingList":
              data = await clients.awaitingList(req.query.limit, req.query.offset);
              break;
            case "completedList":
              data = await clients.completedList();
              break;
          }
        res.json(JSON.stringify(data));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Set the filter settings for a reminder list
router.get("/filter", async (req, res) => {
    try {
        const formData = req.query.data;     // formData in form of query string from AJAX request
        const list = req.query.list;
        const params = new URLSearchParams(formData);
        var data = [];
        const order = params.get("orderByInput");
        const dateRange = params.get("dateRangeInput");
        const month = params.get("rMonth");

        var d1;
        var d2;
        var m = null;

        if (dateRange == "custom") {
            d1 = params.get("d1");
            d2 = params.get("d2");
        } else if (dateRange == "month") {
            d1 = month + "-01";
            d2 = month + "-" + getLastDate(d1.slice(5, 7));
            m = month;
        } else if (dateRange == "all") {
            d1 = "0000-00-00";
            d2 = "9999-12-31";
        }

        if (list == "pending") {
            D1_P = d1;
            D2_P = d2;
            ORDER_P = order;
            if (m) { MONTH_P = m; }
            data = await clients.pendingList(d1, d2, req.query.limit, req.query.offset, order);
        } else if (list == "followUp") {
            D1_FU = d1;
            D2_FU = d2;
            ORDER_FU = order;
            if (m) { MONTH_FU = m; }
            if (params.get("followUp") && params.get("noAns")) {
                data = await clients.followUpList1(d1, d2, req.query.limit, req.query.offset, order);
            } else if (params.get("followUp")) {
                data = await clients.followUpList2(d1, d2, req.query.limit, req.query.offset, order);
            } else if (params.get("noAns")) {
                data = await clients.followUpList3(d1, d2, req.query.limit, req.query.offset, order);
            }
        } else if (list == "awaiting") {
            D1_A = d1;
            D2_A = d2;
            ORDER_A = order;
            if (m) { MONTH_A = m; }
            data = await clients.awaitingList(d1, d2, req.query.limit, req.query.offset, order);
        }
        res.json(JSON.stringify(data));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Fetch the notes for given client
router.get("/load-popup-data", async (req, res) => {
    try {
        const noteData = await clients.clientNotes(req.query.clientId);
        const interactionData = await clients.reminderInteractions(req.query.reminderId);
        const data = {notes:noteData, interactions:interactionData};

        res.json(JSON.stringify(data));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST set client status, AJAX
router.post("/set-reminder-status", async (req, res) => {
    try {
        const formData = req.body.data;     // formData in form of query string from AJAX request
        const rId = req.body.rId;
        const id = req.body.id;
        const params = new URLSearchParams(formData);
        const note = params.get('note');
        const action = params.get('action');
        const outcome = params.get('outcome');

        if (!params.get("noReminder")) {
            if (action == "ignore" || outcome == "booked" || outcome == "declined") {
                // Create new reminder
                await clients.createReminder(params.get("rDate"), id);
            } else if (outcome == "followUp") {
                // Update reminder
                await clients.editReminder(rId, params.get("rDate"));
            }
        }

        await setReminderStatus(action, outcome, note, rId);
        res.status(201).json({ message: "Update successful" });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST set multiple client statuses using checkboxes
router.post("/set-reminder-status-multi", async (req, res) => {
    try {
        var rIds = req.body.reminders;
        var ids = req.body.ids;
        const formData = req.body.formData;     // formData in form of query string from AJAX request
        const params = new URLSearchParams(formData);
        const note = params.get('note');
        const action = params.get('action');
        const outcome = params.get('outcome');
        let rDate = params.get('rDate');

        if (typeof rIds == "string") {       // If only one client has been selected, rIds will be a string, list of rIds if more than one
            rIds = [rIds];
        } else if (typeof rIds == "undefined") {
            rIds = [];
        }
        if (typeof ids == "string") {
            ids = [ids];
        } else if (typeof ids == "undefined") {
            ids = [];
        }

        for (let i = 0; i < rIds.length; i++) {
            if (!params.get("noReminder") && rDate.length > 0) {
                if (action == "ignore" || outcome == "booked" || outcome == "declined") {
                    // Create new reminder
                    await clients.createReminder(rDate, ids[i]);
                } else if (outcome == "followUp") {
                    // Update reminder
                    await clients.editReminder(rIds[i], rDate);
                }
            }
            await setReminderStatus(action, outcome, note, rIds[i]);
        }
        res.status(201).json({ message: "Update successful" });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************
Helper Functions
 ***********************************************/
// Updates a reminder entry in db and creates an interaction
async function setReminderStatus(action, outcome, note, rId) {
    let status = null;
        if (action) {
            if (action == "ignore") {
                status = "completed";
                outcome = "ignored";         // no outcome if ignored
            }
            if (outcome) {
                action += " - " + outcome;
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

        // Add note if one is provided
        if (note.length > 0) {
            await clients.createNote(note, rId);
        }
};

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