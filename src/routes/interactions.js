const express = require("express");
const router = express.Router({ mergeParams: true });   // MergeParams allows for parameters like id to be passed from nested routes

const interactionServices = require("../services/interaction.services");
const interactionModels = require("../models/interaction.models");
const logError = require('../config/logger');
const { log } = require("winston");

/***********************************************************
 * GET
 ***********************************************************/
// Gets the interaction list for a given client
router.get("/", async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const {limit} = req.body;

        let interactions = await interactionModels.getClientInteractions(clientId, req.user.id);

        res.status(200).json({ interactions:interactions });
    } catch (error) {
        logError('Failed to fetch interactions', error, req, {
            clientId: req.params.clientId
        });
        res.status(500).end();
    }
});

/***********************************************************
 * POST
 ***********************************************************/
// Create a new interaction
router.post("/", async (req, res) => {
    try {
        await interactionServices.recordInteraction({
            clientId: req.body.clientId,
            userId: req.user.id,
            reminderId: req.body.reminderId,
            reminderCount: req.body.reminderCount,
            method: req.body.method,
            outcome: req.body.outcome ? req.body.outcome : 'waiting',
            createNewReminder: req.body.createNewReminder === "true",
            moveToNextCycle: req.body.moveToNextCycle === "true",
            newReminderDate: req.body.newReminderDate,
            newReminderNote: req.body.newReminderNote,
        });

        res.status(201).end();
    } catch (error) {
        logError('Failed to create an interaction', error, req, {
            clientId: req.body.clientId, 
            reminderId: req.body.reminderId
        });
        res.status(500).end();
    }
});

/***********************************************************
 * PUT
 ***********************************************************/
// Update interaction and reminder outcome
// Called when user records a response from client to text or email
router.put("/:interactionId", async (req, res) => {
    try {
        // Update interaction and reminder outcome
        await interactionServices.respondInteraction(req.body.clientId, req.params.interactionId, req.body.reminderId, req.body.outcome, req.user.id);

        res.end();
    } catch (error) {
        logError('Failed to edit interaciton', error, req, {
            clientId: req.body.clientId, 
            interactionId: req.params.interactionId, 
            reminderId: req.body.reminderId
        });
        res.status(500).end();
    }
});

module.exports = router;