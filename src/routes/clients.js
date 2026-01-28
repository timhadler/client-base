const express = require("express");
const router = express.Router();
const xl = require("../modules/excel-JS");
const multer = require('multer');                   // For uploading files
const upload = multer({ dest: "uploads/" });

const clientModels = require("../models/client.models");
const clientServices = require("../services/client.services");
const { logError } = require('../config/logger'); 

// Nested route
const interactionsRouter = require("./interactions");
router.use("/:clientId/activity", interactionsRouter)

//   - Client Index
router.get("/", async (req, res) => {
    res.render("clients/clients", { 
        bodyClass: "mainPage", 
        username: req.user.username,
        showNavBar: true 
    });
});

// GET - Show add client form
router.get('/new', (req, res) => {
    res.render('clients/client-form', {
        bodyClass: "",
        username: req.user.username,
        showNavBar: true,
        isEdit: false,
        client: {},
        user: req.user
    });
});

// GET - Show edit client form
router.get('/:id/edit', async (req, res) => {
    try {
        const client = await clientModels.getClientDetails(req.params.id, req.user.id);

        if (!client) {
            req.flash('error', 'Client not found');
            return res.redirect('/clients/new');
        }

        res.render('clients/client-form', {
            bodyClass: "mainPage",
            username: req.user.username,
            showNavBar: true,
            isEdit: true,
            client: client,
            user: req.user
        });
    } catch (error) {
        logError('Failed to render edit client form', error, req);
        req.flash('error', 'Failed to load client');
        res.status(500).redirect('/clients/new');
    }
});

// GET - Load client list
router.get("/load-client-list", async (req, res) => {
    try {
        const data = await clientServices.getClientList({
            userId: req.user.id,
            limit: req.query.limit, 
            offset: req.query.offset, 
            search: req.query.search, 
            status: req.query.status, 
            priortiy: req.query.priority
        })

        res.json(data);
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

// GET - Render client details page
router.get("/:id", async (req, res) => {
    res.render("clients/client-details", { 
        bodyClass: "mainPage", 
        username: req.user.username,
        clientId: req.params.id, 
        showNavBar: true 
    });
});

// GET - Retrieve client data
router.get("/:id/data", async (req, res) => {
    try {
        const id = req.params.id;;
        const client = await clientModels.getClientDetails(id, req.user.id);

        res.json({ client:client });
    } catch (error) {
        logError('Failed to fetch client data', error, req, {
            clientId: req.params.id
        });
        res.status(500).json({ error: 'Fetch client data failed' });
    }
});

// GET - Retrieve client reminder data
router.get("/:id/reminders", async (req, res) => {
    try {
        const reminders = await clientServices.getActiveReminders
        (
            req.params.id, 
            req.user.id,
            Number(req.query.limit)
        );

        res.json({ reminders:reminders });
    } catch (error) {
        logError('Failed to fetch client reminders', error, req, {
            clientId: req.params.id
        });
        res.status(500).json({ error: 'Fetch client reminders failed' });
    }
});

/***********************************************************
 * Add
 ***********************************************************/
// POST - Add a new client
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

        // Respond for AJAX
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(201).json({ success: true, redirectUrl: `/clients/${id}` });
        }

        res.status(201).redirect(`/clients/${id}`);
    } catch (error) {
        logError('Failed to add a new client', error, req, {
            body: req.body
        });
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ error: 'Add new client failed' });
        }
        res.status(500).redirect('/clients');
    }
});

/***********************************************************
 * Edit
 ***********************************************************/
// PUT - Edit an existing client
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

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ success: true, redirectUrl: `/clients/${clientId}` });
        }

        res.redirect(`/clients/${clientId}`);
    } catch (error) {
        logError('Failed to edit a client', error, req, {
            clientId: req.params.id, 
            body: req.body
        });
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ error: 'Update client failed' });
        }
        res.status(500).redirect('/clients');
    }
});

/***********************************************************
 * Delete
 ***********************************************************/
// DELETE - Delete client data including remaining active reminders
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