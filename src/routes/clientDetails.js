//const { response } = require("express");
const express = require("express");
const router = express.Router();
const db = require("./../database");
const clients = require("./../models/client-models");

router.get("/", (req, res) => {
    res.send("How did you get here?");
});

router.get("/add-client", async (req, res) => {
    try {
        const callList = await clients.callList();
        res.render("addClient/addClient.ejs", {callList:callList});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post("/add-client", async (req, res) => {
    try {
        const body = req.body;
        let id = await clients.createClient(body.name, body.comments);

        await clients.createContact(body.contactName, body.number, body.email, 1, id);
        await clients.createReminder(body.rDate, id);
        res.status(201).redirect("/clients/" + id);

    } catch (error) {
        // If error was caused by a duplicate name
        if (error.message.includes("Duplicate entry")) {
            //error message
            // Make sure to repopulate the user input when re-rendering 
            const callList = await clients.callList();
            const error = "Name already exists in client database";
            res.render("addClient/addClient.ejs", {callList:callList, error:error});
            //res.redirect("/");
        } else {
            res.status(400).send(error.message);
        }
    }
});

router.post("/:id/editClient", async (req, res) => {
    try {
        const body = req.body;
        await clients.editClient(req.params.id, body.name, body.comments);
        res.status(201).redirect("/clients/" + req.params.id);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/edit-address/:id", async (req, res) => {
    try {
        const callList = await clients.callList();
        const add = await clients.address(req.params.id);
        //console.log(add.street);
        res.render("addClient/editAddress.ejs", {callList:callList, address:add});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post("/edit-address/:addId-:cId", async (req, res) => {
    try {
        const body = req.body;
        if (body.street != "" && typeof body.freshAir != "undefined") {
            let cAddress = isClientAddress(body.clientAddress);

            await clients.editAddress(req.params.addId, body.street, body.suburb, body.city, body.pc, body.area, body.freshAir, cAddress);
            res.status(201).redirect("/clients/" + req.params.cId);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post("/add-address-:id", async (req, res) => {
    try {
        const body = req.body;
        let cAddress = isClientAddress(body.clientAddress);

        await clients.createAddress(body.street, body.suburb, body.city, body.pc, body.area, body.freshAir, cAddress, req.params.id);
        res.status(201).redirect("/clients/" + req.params.id);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const callList = await clients.callList();
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

router.delete("/delete-address/:cId-:addId", async (req, res) => {
    try {
        await clients.deleteAddress(req.params.addId);
        res.status(204).redirect("/clients/" + req.params.cId);
        //res.send(req.params.id + ": Delete me");   
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Helper
function isClientAddress(i) {
    if (i == "1") {
        return 1;
    } else {
        return  0;
    }
}

module.exports = router;