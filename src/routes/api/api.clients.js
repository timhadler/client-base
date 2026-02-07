const express = require("express");
const router = express.Router();

// For uploading files
const xl = require("../../modules/excel-JS");
const multer = require('multer');
const upload = multer({ dest: "uploads/" });

const clientModels = require("../../models/client.models");
const clientServices = require("../../services/client.services");
const reminderServices = require("../../services/reminder.services");
const { logError } = require('../../config/logger'); 

/***********************************************************
 * Get
 ***********************************************************/
router.get("/", async (req, res) => {
    try {
        const data = await clientServices.getClientList({
            userId: req.user.id,
            limit: req.query.limit, 
            offset: req.query.offset, 
            search: req.query.search, 
            status: req.query.status, 
            priority: req.query.priority
        })

        res.json({
            nClients: data.nClients, 
            clients: data.clientList
        });
    } catch (error) {
        logError('Failed to fetch client list', error, req, {
            search: req.query.search, 
            limit: req.query.limit, 
            offset: req.query.offset,
            status: req.query.status, 
            priority: req.query.priority 
        });
        res.status(500).json({ error: 'Fetch client list failed' });
    }
});

router.get("/:id/reminders", async (req, res) => {
    try {
        const reminders = await clientServices.getActiveReminders
        (
            req.params.id, 
            req.user.id,
            Number(req.query.limit)
        );

        res.json({ 
            reminders: reminders 
        });
    } catch (error) {
        logError('Failed to fetch client reminders', error, req, {
            clientId: req.params.id
        });
        res.status(500).json({ error: 'Fetch client reminders failed' });
    }
});

// Returns a list of past reminders (status = 'complete') for a given client
router.get("/:id/interactions", async (req, res) => {
    try {
        const clientId = req.params.id;
        const limit = Number(req.query.limit);

        let interactions = await clientModels.getClientCompleteReminders(clientId, req.user.id, limit);

        res.json({ 
            interactions: interactions 
        });
    } catch (error) {
        logError('Failed to fetch interactions', error, req, {
            clientId: req.params.id
        });
        res.status(500).json({ error: 'Fetch interactions failed' });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;;
        const client = await clientModels.getClientDetails(id, req.user.id);

        res.json({ 
            client: client 
        });
    } catch (error) {
        logError('Failed to fetch client data', error, req, {
            clientId: req.params.id
        });
        res.status(500).json({ error: 'Fetch client data failed' });
    }
});

/***********************************************************
 * Post
 ***********************************************************/
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        const id = await clientServices.createClient({
            userId: req.user.id,
            createReminder: data.setReminder === 'yes',
            reminderDate: data.reminderDate,
            clientData: {
                firstName: data.firstName,
                lastName: data.lastName || null,
                email: data.email || null,
                phone: data.phone || null,
                company: data.company || null,
                position: data.position || null,

                status: data.status,
                priority: data.priority,
                notes: data.notes || null,
                source: data.source || null,

                line1: data.line1 || null,
                line2: data.line2 || null,
                city: data.city || null,
                state: data.state || null,
                country: data.country || null,
                postcode: data.postcode || null,
            }
        });

        res.status(201).json({ 
            redirectUrl: `/clients/${id}` 
        });
    } catch (error) {
        logError('Failed to add a new client', error, req, {
            body: req.body
        });
        res.status(500).json({ error: 'Add new client failed' });
    }
});

/***********************************************************
 * Put
 ***********************************************************/
router.put('/:id', async (req, res) => {
    try {
        const clientId = req.params.id;
        const data = req.body;

        const updatedClient = {
            first_name: data.firstName,
            last_name: data.lastName || null,
            email: data.email || null,
            phone: data.phone || null,
            company: data.company || null,
            position: data.position || null,
            status: data.status,
            priority: data.priority,
            notes: data.notes || null,
            source: data.source || null,
            line1: data.line1 || null,
            line2: data.line2 || null,
            city: data.city || null,
            state: data.state || null,
            country: data.country || null,
            postcode: data.postcode || null,
        };

        await clientModels.editClient(clientId, updatedClient, req.user.id);

        res.json({ 
            redirectUrl: `/clients/${clientId}` 
        });
    } catch (error) {
        logError('Failed to edit a client', error, req, {
            clientId: req.params.id, 
            body: req.body
        });
        res.status(500).json({ error: 'Update client failed' });
    }
});

// Update reminder outcome (interaction = reminder with status = 'complete')
// Called when user records a response to text or email
router.put("/:id/interactions/:reminderId", async (req, res) => {
    try {
        // Update interaction and reminder outcome
        await reminderServices.respondToReminder(req.params.id, req.params.reminderId, req.body.outcome, req.user.id);

        res.status(204).end();
    } catch (error) {
        logError('Failed to edit interaciton', error, req, {
            reminderId: req.params.reminderId,
            body: req.body
        });
        res.status(500).json({ error: 'Edit interaction failed' });
    }
});

/***********************************************************
 * Delete
 ***********************************************************/
router.delete("/:id", async (req, res) => {
    try {
        await clientServices.deleteClientData(req.params.id, req.user.id)

        res.end();
    } catch (error) {
        logError('Failed to delete a client', error, req, {
            clientId: req.params.id
        });
        res.status(500).json({ error: 'Delete client failed' });
    }
});

module.exports = router;