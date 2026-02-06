const express = require("express");
const router = express.Router();

const clientModels = require("../models/client.models");
const { logError } = require('../config/logger'); 

/***********************************************************
 * Get
 ***********************************************************/
// Client list page
router.get("/", async (req, res) => {
    res.render("clients/clients", { 
        bodyClass: "mainPage", 
        username: req.user.username,
        showNavBar: true 
    });
});

// New client form
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

// Edit client form
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

// Client details page
router.get("/:id", async (req, res) => {
    res.render("clients/client-details", { 
        bodyClass: "mainPage", 
        username: req.user.username,
        clientId: req.params.id, 
        showNavBar: true 
    });
});

module.exports = router;