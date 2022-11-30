const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const router = express.Router();
const clients = require("../models/client-models");

// Globals
global.SEARCH_LIST = [];    // This is the search list and query from the client-list search bar
global.SEARCH = "";

router.get("/", async (req, res) => {
    try {
        // fetch the first 50 clients
        let clientList = await clients.clientList();
        if (SEARCH.length > 0) {
            SEARCH_LIST = await clients.searchList(SEARCH);
        }
        res.render("clients/client-index", {clients:clientList});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Search
router.get("/search", async (req, res) => {
    try {
        if (req.query.search.length > 0) {
            SEARCH = req.query.search;
            SEARCH_LIST = await clients.searchList(SEARCH);
            res.render("clients/client-index");
        } else {
            SEARCH = "";
            SEARCH_LIST = [];
            res.redirect("/clients");
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
})

router.get("/clear-search", (req, res) => {
    try {
        SEARCH = "";
        SEARCH_LIST = [];
        res.redirect("/clients");
    } catch (error) {
        res.status(500).send(error.message);
    }
})

/***********************************************************
 * Add client
 ***********************************************************/
router.post("/add-client", async (req, res) => {
    try {
        const body = req.body;
        let id = await clients.createClient(body.name, body.company, body.comments);

        //await clients.createContact(body.contactName, body.number, body.email, id);
        await clients.createReminder(body.rDate, id);
        res.status(201).redirect("/clients/" + id);

    } catch (error) {
        // If error was caused by a duplicate name
        if (error.message.includes("Duplicate entry")) {
            const error = "Client already exists in database: " + req.body.name;
            let clientList = await clients.clientList();

            res.render("clients/client-index", {clients:clientList, error:error});
        } else {
            res.status(400).send(error.message);
        }
    }
});

// Import clients
router.get("/import-clients", (req, res) => {
    try {
        res.render("clients/importClients")
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post("/import-clients-preview", (req, res) => {
    let test = "false"
    if (req.body.importExcel) {test = "true"};
    res.render("clients/importClients", {test:test})
});

/***********************************************************
 * Edit client tables
 ***********************************************************/
// Edit client
router.post("/:id/editClient", async (req, res) => {
    try {
        const body = req.body;
        await clients.editClient(req.params.id, body.name, body.company, body.comments);
        res.status(201).redirect("/clients/" + req.params.id);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST add address (popup)
router.post("/add-address-:id", async (req, res) => {
    try {
        const body = req.body;
        let cAddress = isClientAddress(body.clientAddress);

        await clients.createAddress(body.street, body.suburb, body.city, body.pc, body.freshAir, cAddress, req.params.id);
        res.status(201).redirect("/clients/" + req.params.id);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// POST Edit address
router.post("/edit-address/:addId-:cId", async (req, res) => {
    try {
        const body = req.body;
        if (body.street != "" && typeof body.freshAir != "undefined") {
            let cAddress = isClientAddress(body.clientAddress);

            await clients.editAddress(req.params.addId, body.street, body.suburb, body.city, body.pc, body.freshAir, cAddress);
            res.status(201).redirect("/clients/" + req.params.cId);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST add contact
router.post("/add-contact/:id", async (req, res) => {
    try {
        const body = req.body;

        await clients.createContact(body.contactName, body.number, body.email, req.params.id);
        res.status(201).redirect("/clients/" + req.params.id);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST edit contact (popup)
router.post("/edit-contact/:conId-:cId", async (req, res) => {
    try {
        const body = req.body;

        await clients.editContact(req.params.conId, body.contactName, body.number, body.email);
        res.status(201).redirect("/clients/" + req.params.cId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST add reminder
router.post("/add-reminder/:id", async (req, res) => {
    try {
        const body = req.body;

        await clients.createReminder(body.rDate, req.params.id)
        CLIENT_LIST = await clients.callList(D1, D2);
        res.status(201).redirect("/clients/" + req.params.id);
    } catch (error) {
        res.status(500).send(error.message);
    }
}) 

// POST edit reminder (popup)
router.post("/edit-reminder/:rId-:cId", async (req, res) => {
    try {
        const body = req.body;

        await clients.editReminder(req.params.rId, body.rDate);
        res.status(201).redirect("/clients/" + req.params.cId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST edit comment reminder (popup)
router.post("/edit-comments/:id", async (req, res) => {
    try {
        const body = req.body;

        await clients.editComment(req.params.id, body.comments);
        res.status(201).redirect("/clients/" + req.params.id);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * GET Client details
 ***********************************************************/
router.get("/:id", async (req, res) => {
    try {
        let details = await clients.clientDetails(req.params.id);

        // fetch the first 50 clients for list
        let clientList = await clients.clientList();
        
        // Convert dates to a nicer format to display
        for (let i = 0; i < details.calls.length; i++) {
            details.calls[i].rDate = details.calls[i].rDate.toLocaleDateString('en-GB');
        }

        if (details.client != null) {
            res.status(200).render("clients/client-details.ejs", {details:details, clients:clientList});
        } else {
            res.redirect("/");
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * Delete
 ***********************************************************/
// Delete client and all associated data
router.delete("/:id/delete-client", async (req, res) => {
    try {
        await clients.deleteClientData(req.params.id);
        res.status(204).redirect("/clients");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete from addresses table
router.delete("/delete-address/:cId-:addId", async (req, res) => {
    try {
        await clients.deleteAddress(req.params.addId);
        res.status(204).redirect("/clients/" + req.params.cId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete from reminders table
router.delete("/delete-date/:cId-:dId", async (req, res) => {
    try {
        await clients.deleteReminder(req.params.dId);
        res.status(204).redirect("/clients/" + req.params.cId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete from contacts table
router.delete("/delete-contact/:cId-:conId", async (req, res) => {
    try {
        await clients.deleteContact(req.params.conId);
        res.status(204).redirect("/clients/" + req.params.cId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * Helper functions
 ***********************************************************/
function isClientAddress(i) {
    if (i == "1") {
        return 1;
    } else {
        return  0;
    }
}

module.exports = router;