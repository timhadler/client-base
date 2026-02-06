const express = require("express");
const router = express.Router();

const reminderServices = require("../services/reminder.services");   
const reminderModels = require("../models/reminder.models");
const { logError } = require('../config/logger');   

/***********************************************************
 * Get
 ***********************************************************/
router.get("/", async (req, res) => {
    res.render("reminders/reminders", {
        bodyClass:"mainPage", 
        username: req.user.username, 
        showNavBar:true
    });
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
            reminderCount: 0,   // New reminder starts at 0
            clientId: req.body.clientId, 
            userId: req.user.id
        });

        res.status(201).send();
    } catch (error) {
        logError('Failed to create a new reminder', error, req, {
            date: req.body.date,
            clientId: req.body.clientId, 
            note: req.body.note, 
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
            reminderId: req.params.id
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

module.exports = router;