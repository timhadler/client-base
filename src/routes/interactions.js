const express = require("express");
const router = express.Router({ mergeParams: true });   // MergeParams allows for parameters like id to be passed from nested routes
const interactionServices = require("../services/interaction.services");
const interactionModels = require("../models/interaction.models");

/***********************************************************
 * GET
 ***********************************************************/
// Gets the interaction list for a given client
router.get("/", async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const limit = Number(req.query.limit);

        let interactions = await interactionModels.getClientInteractions(clientId, req.user.id, limit);

        res.status(200).json({ interactions:interactions });
    } catch (error) {
        res.status(500).send(error.message);
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

        res.status(201).json({ message: "Creation successful" });
    } catch (error) {
        res.status(500).send(error.message);
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

        res.status(204).json({ message: "Update successful" });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;