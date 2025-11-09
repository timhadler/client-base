const express = require("express");
const router = express.Router({ mergeParams: true });   // MergeParams allows for parameters liek id to be passed from nested routes
const clients = require("../models/client-models");

router.get("/", async (req, res) => {
    try {
        const clientId = req.params.id;
        console.log(clientId, "inter");
        const {limit} = req.body;

        let interactions = await clients.getClientInteractions(clientId);

        res.json({ interactions:interactions });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;