const express = require("express");
const router = express.Router({ mergeParams: true });   // MergeParams allows for parameters like id to be passed from nested routes
const clients = require("../models/client-models");

/***********************************************************
 * GET
 ***********************************************************/
router.get("/", async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const {limit} = req.body;

        let interactions = await clients.getClientInteractions(clientId, req.user.id);

        res.status(200).json({ interactions:interactions });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * POST
 ***********************************************************/
router.post("/", async (req, res) => {                          // NEED to update contact date fields in clients table, reminders (last contact etc), and check other fields
    try {
        const clientId = req.body.clientId;
        const reminderId = req.body.reminderId;
        const method = req.body.method;
        const outcome = req.body.outcome ? req.body.outcome : 'waiting';
        const createReminder = req.body.createNewReminder === "true";
        const reminderDate = req.body.newReminderDate;
        const reminderNote = req.body.newReminderNote;

        let userId = req.user.id;
        let reminderCount = 0; // PLACEHOLDER

        // Create interaction
        await clients.createInteraction(clientId, reminderId, method, outcome, userId);

        // Optional: create new reminder
        if (createReminder) {
            await clients.createReminder(reminderDate, false, reminderNote, reminderCount, clientId, userId);
        }

        // Set current reminder complete
        await clients.completeReminder(reminderId, userId);

        res.status(201).json({ message: "Creation successful" });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * PUT
 ***********************************************************/
router.put("/:interactionId", async (req, res) => {
    try {
        const reminderId = req.params.interactionId;
        const outcome = req.body.outcome;

        if (outcome !== 'no_answer') {
            await clients.respondInteraction(reminderId, outcome, req.user.id);
        }
        res.status(204).json({ message: "Update successful" });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;