const express = require("express");
const router = express.Router({ mergeParams: true });   // MergeParams allows for parameters liek id to be passed from nested routes
const clients = require("../models/client-models");

/***********************************************************
 * GET
 ***********************************************************/
router.get("/", async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const {limit} = req.body;

        let interactions = await clients.getClientInteractions(clientId);

        res.status(200).json({ interactions:interactions });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * post
 ***********************************************************/
router.post("/:reminderId", async (req, res) => {
    try {
        //const clientId = req.params.clientId;
        const reminderId = req.body.reminderId;
        const method = req.body.method;
        const outcome = req.body.outcome;

        await clients.createInteraction(reminderId, method, outcome);

        res.status(201).json({ message: "Creation successful" });
    } catch (error) {
        console.error("Error:", error)
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * Put
 ***********************************************************/
router.put("/:interactionId", async (req, res) => {
    try {
        const reminderId = req.params.interactionId;
        const outcome = req.body.outcome;

        if (outcome !== 'no_answer') {
            await clients.respondInteraction(reminderId, outcome);
        }
        res.status(204).json({ message: "Update successful" });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;