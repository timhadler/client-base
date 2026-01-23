const express = require("express");
const router = express.Router();
const reminderServices = require("../services/reminder.services");   
const reminderModels = require("../models/reminder.models");   

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
global.ORDER_A = "latest_created"

/***********************************************************
 * Get
 ***********************************************************/
router.get("/", async (req, res) => {
    try {
        res.status(200).render("reminders/reminders", {bodyClass:"mainPage", username: req.user.username, showNavBar:true, month_p:MONTH_P, month_fu:MONTH_FU, month_a:MONTH_A, d1_p:D1_P, d2_p:D2_P, d1_fu:D1_FU, d2_fu:D2_FU, d1_a:D1_A, d2_a:D2_A});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get the paginated filtered reminder list
// Also returns list counts for appropriate filters
router.get("/load-reminder-list", async (req, res) => {
    try {
        const data = await reminderServices.loadReminderList({
            filter: req.query.filter,
            userId: req.user.id, 
            limit: req.query.limit, 
            offset: req.query.offset
        });

        res.json(JSON.stringify(data));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * Post
 ***********************************************************/
// Create a new reminder
router.post("/add", async (req, res) => {
    try {
        await reminderServices.addReminder({
            date: req.body.date, 
            important: false,   // Placeholder for now 
            note: req.body.note, 
            reminderCount: 1, 
            clientId: req.body.clientId, 
            userId: req.user.id
        });

        res.status(200).json({ message: "Add reminder successful" });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST set multiple client statuses using checkboxes
// router.post("/set-reminder-status-multi", async (req, res) => {
//     try {
//         var rIds = req.body.reminders;
//         var ids = req.body.ids;
//         const formData = req.body.formData;     // formData in form of query string from AJAX request
//         const params = new URLSearchParams(formData);
//         const note = params.get('note');
//         const action = params.get('action');
//         const outcome = params.get('outcome');
//         let rDate = params.get('rDate');

//         if (typeof rIds == "string") {       // If only one client has been selected, rIds will be a string, list of rIds if more than one
//             rIds = [rIds];
//         } else if (typeof rIds == "undefined") {
//             rIds = [];
//         }
//         if (typeof ids == "string") {
//             ids = [ids];
//         } else if (typeof ids == "undefined") {
//             ids = [];
//         }

//         for (let i = 0; i < rIds.length; i++) {
//             if (!params.get("noReminder") && rDate.length > 0) {
//                 if (action == "ignore" || outcome == "booked" || outcome == "declined") {
//                     // Create new reminder
//                     await clients.createReminder(rDate, "pending", ids[i]);
//                 } else if (outcome == "followUp") {
//                     // Update reminder
//                     await clients.editReminder(rIds[i], rDate);
//                 }
//             }
//             //wait setReminderStatus(action, outcome, note, ids[i], rIds[i]);
//         }
//         res.status(201).json({ message: "Update successful" });
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

/***********************************************************
 * Put
 ***********************************************************/
// Edit a reminder
router.post("/:id/edit", async (req, res) => {
    try {
        await reminderServices.editReminder({
            id: req.params.id, 
            date: req.body.date, 
            important: false,   // Placeholder for now
            note: req.body.note, 
            userId: req.user.id
        })

        res.status(201).json({ message: "Update successful" });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * Delete
 ***********************************************************/
router.delete("/:id", async (req, res) => {
    try {
        await reminderServices.deleteReminder({
            id: req.params.id, 
            userId: req.user.id
        });

        res.status(204).json({message: "Delete successful"});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// DELETE multi clients
// router.delete("/multi-delete", async (req, res) => {
//     try {
//         var ids = req.body.ids;

//         // If only one selected, ids will be a string, put in list for the for loop
//         if (typeof ids == "string") {
//             ids = [ids];
//         } else if (typeof ids == "undefined") {
//             ids = [];
//         }

//         for (let i = 0; i < ids.length; i++) {
//             await clients.deleteClient(ids[i]);
//         }

//         res.status(200).end();
//     } catch (error) {
//         res.status(404).send(error.message);
//     }
// });

/***********************************************
Helper Functions
 ***********************************************/
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