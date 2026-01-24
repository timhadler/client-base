const express = require("express");
const router = express.Router();
const reminderServices = require("../services/reminder.services");   
const reminderModels = require("../models/reminder.models");   

/***********************************************************
 * Get
 ***********************************************************/
router.get("/", async (req, res) => {
    try {
        res.status(200).render("reminders/reminders", {
            bodyClass:"mainPage", 
            username: 
            req.user.username, 
            showNavBar:true
        });
        
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
            reminderCount: req.query.reminderCount,
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