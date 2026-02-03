const express = require("express");
const router = express.Router({ mergeParams: true });   // MergeParams allows for parameters like id to be passed from nested routes

const interactionServices = require("../services/interaction.services");
const interactionModels = require("../models/interaction.models");
const reminderServices = require("../services/reminder.services"); 
const clientModels = require("../models/client.models"); 
const { logError } = require('../config/logger');

/***********************************************************
 * GET
 ***********************************************************/
// Gets the interaction list for a given client
router.get("/", async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const limit = Number(req.query.limit);

        let interactions = await clientModels.getClientCompleteReminders(clientId, req.user.id, limit);

        res.json({ interactions:interactions });
    } catch (error) {
        logError('Failed to fetch interactions', error, req, {
            clientId: req.params.clientId
        });
        res.status(500).json({ error: 'Fetch interactions failed' });
    }
});

/***********************************************************
 * POST
 ***********************************************************/
// Create a new interaction
router.post("/", async (req, res) => {
    try {
        await reminderServices.completeReminder({
            clientId: req.body.clientId,
            userId: req.user.id,
            reminderId: req.body.reminderId,
            reminderCount: req.body.reminderCount,
            method: req.body.method,
            outcome: req.body.outcome,
            createNewReminder: req.body.createNewReminder === "true",
            moveToNextCycle: req.body.moveToNextCycle === "true",
            newReminderDate: req.body.newReminderDate,
            newReminderNote: req.body.newReminderNote,
        });

        res.status(201).send();
    } catch (error) {
        logError('Failed to create an interaction', error, req, {
            body: req.body
        });
        res.status(500).json({ error: 'Add interaction failed' });
    }
});

/***********************************************************
 * PUT
 ***********************************************************/
// Update interaction and reminder outcome
// Called when user records a response from client to text or email
router.put("/:reminderId", async (req, res) => {
    try {
        // Update interaction and reminder outcome
        await reminderServices.respondToReminder(req.body.clientId, req.params.reminderId, req.body.outcome, req.user.id);

        res.status(204).end();
    } catch (error) {
        logError('Failed to edit interaciton', error, req, {
            reminderId: req.params.reminderId,
            body: req.body
        });
        res.status(500).json({ error: 'Edit interaction failed' });
    }
});

module.exports = router;