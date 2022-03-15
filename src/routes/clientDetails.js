//const { response } = require("express");
const express = require("express");
const router = express.Router();
const db = require("./../database");
const clients = require("./../models/client-models");
const globals = require("./../globals");

router.get("/", (req, res) => {
    res.send("How did you get here?");
});

// Search
router.get("/search", async (req, res) => {
    try {
        const clientList = await clients.searchList(req.query.search);
        res.render("index", {list: clientList});
    } catch (error) {
        res.status(500).send(error.message);
    }
})

/***********************************************************
 * Add client
 ***********************************************************/
router.get("/add-client", async (req, res) => {
    try {
        res.render("addClient/addClient.ejs");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post("/add-client", async (req, res) => {
    try {
        const body = req.body;
        let id = await clients.createClient(body.name, body.company, body.comments);

        await clients.createContact(body.contactName, body.number, body.email, id);
        await clients.createReminder(body.rDate, id);
        res.status(201).redirect("/clients/" + id);

    } catch (error) {
        // If error was caused by a duplicate name
        if (error.message.includes("Duplicate entry")) {
            //error message
            // Make sure to repopulate the user input when re-rendering 
            const error = "Name already exists in client database";
            res.render("addClient/addClient.ejs", {error:error});
            //res.redirect("/");
        } else {
            res.status(400).send(error.message);
        }
    }
});

/***********************************************************
 * Edit tables
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

// GET Client details
router.get("/:id", async (req, res) => {
    try {
        const callList = await clients.callList(globals.d1, globals.d2);
        let details = await clients.clientDetails(req.params.id);
        //console.log(details);
        
        // Convert dates to a nicer format to display
        for (let i = 0; i < details.calls.length; i++) {
            details.calls[i].rDate = details.calls[i].rDate.toLocaleDateString();
        }

        if (details.client != null) {
            res.status(200).render("clientDetails/client-details.ejs", {callList:callList, details:details});
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
// Delete from addresses table
router.delete("/delete-address/:cId-:addId", async (req, res) => {
    try {
        await clients.deleteAddress(req.params.addId);
        res.status(204).redirect("/clients/" + req.params.cId);
        //res.send(req.params.id + ": Delete me");   
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete from reminders table
router.delete("/delete-date/:cId-:dId", async (req, res) => {
    try {
        await clients.deleteReminder(req.params.dId);
        res.status(204).redirect("/clients/" + req.params.cId);
        //res.send(req.params.id + ": Delete me");   
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete from contacts table
router.delete("/delete-contact/:cId-:conId", async (req, res) => {
    try {
        await clients.deleteContact(req.params.conId);
        res.status(204).redirect("/clients/" + req.params.cId);
        //res.send(req.params.id + ": Delete me");   
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