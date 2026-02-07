const express = require("express");
const router = express.Router();

const reminderServices = require("../../services/reminder.services");   
const { logError } = require('../../config/logger');  

/***********************************************************
 * Get
 ***********************************************************/
// Fetch the paginated filtered reminder list
// Returns list counts for tab filters
// Filter: 'all', 'overdue', 'today', 'thisMonth', 'initial', 'followup', 'completed'
router.get("/", async (req, res) => {
    try {
        const data = await reminderServices.loadReminderList({
            filter: req.query.filter,
            reminderCount: req.query.reminderCount,
            userId: req.user.id, 
            limit: req.query.limit, 
            offset: req.query.offset
        });

        res.json({
            data: data.listData, 
            counts: data.listCounts, 
            pageTotal: data.total
        });
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
router.post("/", async (req, res) => {
    try {
        await reminderServices.addReminder({
            date: req.body.date, 
            important: false,   // Placeholder for now 
            note: req.body.note, 
            reminderCount: 0,   // New reminder starts at 0
            clientId: req.body.clientId, 
            userId: req.user.id
        });

        res.status(201).end();
    } catch (error) {
        logError('Failed to create a new reminder', error, req, {
            date: req.body.date,
            clientId: req.body.clientId, 
            note: req.body.note, 
        })
        res.status(500).json({ error: 'Add new reminder failed' });
    }
});

// Implements workflow logic to complete a reminder
router.post("/:id/complete", async (req, res) => {
    try {
        await reminderServices.completeReminder({
            clientId: req.body.clientId,
            userId: req.user.id,
            reminderId: req.params.id,
            reminderCount: req.body.reminderCount,
            method: req.body.method,
            outcome: req.body.outcome,
            createNewReminder: req.body.createNewReminder ? true : false,
            moveToNextCycle: req.body.moveToNextCycle ? true : false,
            newReminderDate: req.body.newReminderDate,
            newReminderNote: req.body.newReminderNote,
        });

        res.status(204).end();
    } catch (error) {
        logError('Failed to create an interaction', error, req, {
            body: req.body
        });
        res.status(500).json({ error: 'Add interaction failed' });
    }
});

/***********************************************************
 * Put
 ***********************************************************/
router.put("/:id", async (req, res) => {
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