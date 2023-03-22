const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const router = express.Router();
const clients = require("../models/client-models");
xl = require("../modules/excel-JS");
const multer = require('multer');                   // For uploading files
const upload = multer({ dest: "uploads/" });

// Constants
const rowLimit = 50;

router.get("/", async (req, res) => {
    try {
        // fetch the first 50 clients
        let list = [];
        let details = null;
        const nClients = await clients.clientNumber();
        if (typeof req.query.search != 'undefined') {
            if (req.query.search.length > 0) {
                list = await clients.searchList(req.query.search);
            } else {
                list = await clients.clientList(rowLimit);
            }
        } else {
            list = await clients.clientList(rowLimit);
        }
        if (typeof req.query.clientID != 'undefined') {
            details = await clients.clientDetails(req.query.clientID);
            
            // Convert dates to a nicer format to display
            for (let i = 0; i < details.calls.length; i++) {
                details.calls[i].rDate = details.calls[i].rDate.toLocaleDateString('en-GB');
            }
        }
        res.status(200).render("clients/clients", {clients:list, search:req.query.search, details:details, nClients:nClients});
    } catch (error) {
        // Check if error resulted from search query, single qoutes cause sql syntax error
        if (error.message.includes("You have an error in your SQL syntax") && error.message.includes("WHERE name LIKE")) {
            const nClients = await clients.clientNumber();
            res.status(400).render("clients/clients", {clients:[], nClients:nClients, error:"Error in search, single qoutes (') are not allowed: " + req.query.search});
        } else {
            res.status(500).send(error.message);
        }
    }
});

// Import clients
router.get("/import-clients", (req, res) => {
    try {
        res.status(200).render("clients/importClients")
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Export clients
router.get("/exportClients", async (req, res) => {
    try {
        // let details = [await clients.clientDetails(38)];
        // details.push(await clients.clientDetails(974));
        // let data = [];
        // for (let i = 0; i < details.length; i++) {
        //     let address = {street: "", suburb:"", city:"", pc:""};
        //     let contact = {email:"", phone:""};
        //     let call = "";

        //     if (details[i].addresses.length > 0) { address = details[i].addresses[0] };
        //     if (details[i].contacts.length > 0) { contact = details[i].contacts[0]; };
        //     if (details[i].calls.length > 0) { call = details[i].calls[0].rDate.toLocaleDateString('en-GB');; };

        //     data.push({Name:details[i].client.name, Company:details[i].client.company, Email:contact.email, Phone: contact.phone, 
        //         Street:address.street, Suburb:address.suburb, City: address.city, Postcode:address.pc,
        //         Comments:details[i].client.comments, Reminder:call});
        // }
        
        // xl.writeTable(data, "exports/clientExport.xlsx");
        // res.send(data);
        res.status(200).render("clients/exportClients");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * Add client
 ***********************************************************/
router.post("/add-client", async (req, res) => {
    try {
        const body = req.body;
        let id = await clients.createClient(body.name, body.company, body.comments);

        await clients.createReminder(body.rDate, id);
        res.status(201).redirect("/clients/?clientID=" + id);
    } catch (error) {
        // If error was caused by a duplicate name
        if (error.message.includes("Duplicate entry")) {
            const error = "Client already exists in database: " + req.body.name;
            let clientList = await clients.clientList(rowLimit);

            res.render("clients/clients", {clients:clientList, error:error});
        } else {
            res.status(400).send(error.message);
        }
    }
});

router.post("/import-clients", upload.single("importExcel"), async (req, res) => {
    try {
        // Verifying file
        const mandatoryExcelHeaders = ['First', 'Last', 'Company', 'Email', 'Mobile', 'Street', 'Suburb', 'City', 'Postcode', 'ReminderDate'];

        if (req.file == null) {
            res.redirect("/clients/import-clients");
        } else {
            let n = 0;              // number of succesful client uploads
            let fails = [];         // List of clients that resulted in error and the error message, list of objects
            let duplicates = [];    // List of clients that failed due to a duplicate name error
            let noReminderDate = [];
            let incorrectReminders = [];
            let clientObjs = [];

            try {
                clientObjs = xl.readData(req.file.originalname, (req.file.path), mandatoryExcelHeaders);
            } catch (error) {
                let message = error.message;
                if (message.includes("no such file or directory")) {
                    message = "No such file or directory.";
                }
                res.render("clients/importClients", {error:message});
                return;
            }

            let clientNumber = clientObjs.length;
            for (let i = 0; i < clientNumber; i++) {
                const date = clientObjs[i].ReminderDate;
                let comments = clientObjs[i].Comments;
                const address = clientObjs[i].Street;
                const phone = clientObjs[i].Mobile;
                const firstName = clientObjs[i].First;

                if (typeof comments == 'undefined') { comments = "" };  // Avoid reading length of undefined error
                if (firstName.trim().length == 0) { fails.push({name:("Client (index: " + (i + 2) + ") failed upload"), message:"No name provided"}); continue;};   // If no name was provided, push to fails list

                try {
                    const clientName = firstName + " " + clientObjs[i].Last;
                    const client_id = await clients.createClient(clientName, clientObjs[i].Company, comments);
                    n++;
                    // Check for duplicates
                    const dups = await clients.getClientsByName(clientName);
                    if (dups.length > 1 && !duplicates.includes(clientName)) {
                        duplicates.push(clientName);
                    }
                    if (address != null && typeof address != 'undefined') { 
                        await clients.createAddress(address, clientObjs[i].Suburb, clientObjs[i].City, clientObjs[i].Postcode, "Unknown", 1, client_id);
                    }
                    if (typeof phone != 'undefined' && phone != null) {
                        if (typeof phone == 'string') {
                            if (phone.length > 0) {
                                await clients.createContact(firstName, phone, clientObjs[i].Email, client_id);
                            }
                        } else {
                            await clients.createContact(firstName, phone, clientObjs[i].Email, client_id);
                        }
                    }
                    await clients.createReminder(convertDate(date), client_id);
                } catch (error) {
                    if (error.message.includes("Incorrect date value") || error.message.includes("Column 'rDate' cannot be null")) {
                        noReminderDate.push(firstName + " " + clientObjs[i].Last);
                        continue;
                    } else if (error.message.includes("date.slice is not a function") || error.message.includes("date.split is not a function")) {
                        incorrectReminders.push(clientObjs[i].First + " " + clientObjs[i].Last);
                        continue;
                    } else {
                        fails.push({name:firstName + " " + clientObjs[i].Last, message:error.message});
                        continue;
                    }
                }
            }
            res.status(200).render("clients/importClients", {successes:n, total:clientNumber, fails:fails, duplicates:duplicates, noReminderDate:noReminderDate, incorrectReminders:incorrectReminders});
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * Edit client tables
 ***********************************************************/
// Edit client
router.post("/:id/editClient", async (req, res) => {
    try {
        const body = req.body;
        await clients.editClient(req.params.id, body.name, body.company, body.comments);
        res.status(201).redirect('back');
        //res.status(201).redirect("/clients/?clientID=" + req.params.id);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST add address
router.post("/add-address-:id", async (req, res) => {
    try {
        const body = req.body;
        let cAddress = isClientAddress(body.clientAddress);

        await clients.createAddress(body.street, body.suburb, body.city, body.pc, body.freshAir, cAddress, req.params.id);
        res.status(201).redirect('back');
        //res.status(201).redirect("/clients/?clientID=" + req.params.id);
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
            res.status(201).redirect('back');
            //res.status(201).redirect("/clients/?clientID=" + req.params.cId);
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
        res.status(201).redirect('back');
        //res.status(201).redirect("/clients/?clientID=" + req.params.id);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST edit contact (popup)
router.post("/edit-contact/:conId-:cId", async (req, res) => {
    try {
        const body = req.body;

        await clients.editContact(req.params.conId, body.contactName, body.number, body.email);
        res.status(201).redirect('back');
        //res.status(201).redirect("/clients/?clientID=" + req.params.cId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST add reminder
router.post("/add-reminder/:id", async (req, res) => {
    try {
        const body = req.body;

        await clients.createReminder(body.rDate, req.params.id)
        res.status(201).redirect('back');
        //res.status(201).redirect("/clients/?clientID=" + req.params.id);
    } catch (error) {
        res.status(500).send(error.message);
    }
}) 

// POST edit reminder (popup)
router.post("/edit-reminder/:rId-:cId", async (req, res) => {
    try {
        const body = req.body;

        await clients.editReminder(req.params.rId, body.rDate);
        res.status(201).redirect('back');
        //res.status(201).redirect("/clients/?clientID=" + req.params.cId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST edit comment reminder (popup)
router.post("/edit-comments/:id", async (req, res) => {
    try {
        const body = req.body;

        await clients.editComment(req.params.id, body.comments);
        res.status(201).redirect('back');
        //res.status(201).redirect("/clients/?clientID=" + req.params.id);
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
        res.status(204).redirect(req.get('referer').slice(0, req.get('referer').indexOf("clientID=")));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete from addresses table
router.delete("/delete-address/:cId-:addId", async (req, res) => {
    try {
        await clients.deleteAddress(req.params.addId);
        res.status(204).redirect('back');
        //res.status(204).redirect("/clients/?clientID=" + req.params.cId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete from reminders table
router.delete("/delete-date/:cId-:dId", async (req, res) => {
    try {
        await clients.deleteReminder(req.params.dId);
        res.status(204).redirect('back');
        //res.status(204).redirect("/clients/?clientID=" + req.params.cId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete from contacts table
router.delete("/delete-contact/:cId-:conId", async (req, res) => {
    try {
        await clients.deleteContact(req.params.conId);
        res.status(204).redirect('back');
        //res.status(204).redirect("/clients/?clientID=" + req.params.cId);
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

// Converts a date to format suitable for inserting into database
// Input eg: "01-Feb-2021"
// Output: "2022-02-01"
function convertDate(date) {
    if (typeof date == 'undefined') {
        return null;
    }

    let s = date.split('-');
    if (s.length != 3) {
        s = date.split('/');
    }
    if (s.length != 3) {
        return null;
    }

    let day = s[0];
    let month = s[1];
    const year = s[2];

    if (day.length == 1) {
        day = '0' + day;
    }
    if (month.length == 1) {
        month = '0' + month;
    }

    // const day = date.slice(0, 2);
    // let month = date.slice(3, 6);
    // const year = date.slice(7, 11);

    switch(month) {
        case ("Jan"): 
            month = "01";
            break;
        case ("Feb"): 
            month = "02";
        break;
        case ("Mar"): 
            month = "03";
            break;
        case ("Apr"): 
            month = "04";
            break;
        case ("May"): 
            month = "05";
            break;
        case ("Jun"): 
            month = "06";
            break;
        case ("Jul"): 
            month = "07";
            break;
        case ("Aug"): 
            month = "08";
            break;
        case ("Sep"): 
            month = "09";
            break;
        case ("Oct"): 
            month = "10";
            break;
        case ("Nov"): 
            month = "11";
            break;
        case ("Dec"): 
            month = "12";
            break;
    }
    const nDate = year + "-" + month + "-" + day
    return nDate;
}

module.exports = router;