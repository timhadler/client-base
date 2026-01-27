const express = require("express");
const router = express.Router();

const reminderServices = require("../services/reminder.services");   
const reminderModels = require("../models/reminder.models");
const { logError } = require('../config/logger');   

/***********************************************************
 * Get
 ***********************************************************/
router.get("/", async (req, res) => {
    try {
        res.render("reminders/reminders", {
            bodyClass:"mainPage", 
            username: req.user.username, 
            showNavBar:true
        });
        
    } catch (error) {
        logError('Failed to render reminders page', error, req);
        res.status(500).json({ error: 'Render reminders page failed' });
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
        logError('Failed to load reminder list', error, req, {
            filter: req.query.filter,
            limit: req.query.limit, 
            offset: req.query.offset
        });
        res.status(500).json({ error: 'Fetch reminder list failed' });
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

        res.status(201).send();
    } catch (error) {
        logError('Failed to create a new reminder', error, req, {
            clientId: req.body.clientId
        })
        res.status(500).json({ error: 'Add new reminder failed' });
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

        res.status(204).end();
    } catch (error) {
        logError('Failed to edit reminder', error, req, {
            reminderId: req.params.id   // Can get clientId here too?
        });
        res.status(500).json({ error: 'Edit reminder failed' });
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

        res.status(204).end();
    } catch (error) {
            logError('Failed to delete reminder', error, req, {
                reminderId: req.params.id
        });
        res.status(500).json({ error: 'Delete reminder failed' });
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