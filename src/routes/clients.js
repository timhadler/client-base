const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const router = express.Router();
const clients = require("../models/client-models");
xl = require("../modules/excel-JS");
const multer = require('multer');                   // For uploading files
const upload = multer({ dest: "uploads/" });

// Client Index
router.get("/", async (req, res) => {
    try {
        res.status(200).render("clients/clients");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Load client list
router.get("/load-client-list", async (req, res) => {
    try {
        const search = req.query.search;
        var n = 0;
        var clientList = [];

        // If a search is provided, search list, client list if not
        if (typeof search != 'undefined') {
            if (search.length > 0) {
                clientList = await clients.searchList(search);
                if (clientList.length > 0) {
                    n = clientList[0].n;
                }
            } else {
                clientList = await clients.clientList(req.query.limit, req.query.offset);
                n = await clients.clientNumber();
            }
        } else {
            clientList = await clients.clientList(req.query.limit, req.query.offset);
            n = await clients.clientNumber();
        }

        res.json(JSON.stringify({clientList:clientList, nClients:n}));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Load client data for display, including notes, and reminder
router.get("/load-client-data", async (req, res) => {
    try {
        const id = req.query.id;
        var data = await clients.clientDetails(id);
        const notes = await clients.clientNotes(id);
        const reminder = await clients.clientReminder(id);

        data.notes = notes;

        // Convert sql dates to nicer date to local date time
        const clientCreated = data.created;
        const cDate = new Date(clientCreated);
        data.created = cDate.toLocaleDateString('en-GB');

        if (reminder) {
            console.log("here")
            let rDate = reminder.rDate;
            rDate = new Date(rDate);
            reminder.rDate = rDate.toLocaleDateString('en-GB');
            data.reminder =  reminder;
        } else {
            // Empty reminder for front end display
            data.reminder = {rDate:"", status:""};
        }

        for (let i = 0; i < notes.length; i++) {
            const noteCreated = notes[i].created;
            const nDate = new Date(noteCreated);
            notes[i].created = nDate.toLocaleDateString('en-GB');
        }

        res.json(JSON.stringify(data));
    } catch (error) {
        res.status(500).send(error.message);
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
 * Add
 ***********************************************************/
router.post("/add-client", async (req, res) => {
    try {
        const formData = req.body.data;
        const params = new URLSearchParams(formData);
        const name = params.get('name');
        const company = params.get('company');
        const telephone = params.get('telephone');
        const mobile = params.get('mobile');
        const email = params.get('email');
        const street = params.get('street');
        const suburb = params.get('suburb');
        const city = params.get('city');
        const pc = params.get('pc');

        // Create new client
        let id = await clients.createClient(name, company, telephone, mobile, email, street, suburb, city, pc);

        //await clients.createReminder(body.rDate, id);
        res.status(201).json({ id:id });
    } catch (error) {
        // If error was caused by a duplicate name
        if (error.message.includes("Duplicate entry")) {
            const error = "Client already exists in database: " + req.body.name;
            //let clientList = await clients.clientList(rowLimit);

            res.render("clients/clients", {clients:clientList, error:error});
        } else {
            res.status(400).send(error.message);
        }
    }
});

// POST add note
router.post("/add-note", async (req, res) => {
    try {
        const data = req.body.data;
        const params = new URLSearchParams(data);
        const note = params.get('note');
        const id = req.body.id;

        if (note.length > 0) {
            await clients.createNote(note, id)
        }
        res.status(201).end();
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
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * Import clients
 ***********************************************************/
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
                const mobile = clientObjs[i].Mobile;
                let home = clientObjs[i].Phone;
                if (typeof home =='undefined') {home=null};
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
                    if (typeof mobile != 'undefined' && mobile != null) {
                        if (typeof mobile == 'string') {
                            if (mobile.length > 0) {
                                await clients.createContact(firstName, mobile, home, clientObjs[i].Email, client_id);
                            }
                        } else {
                            await clients.createContact(firstName, mobile, home, clientObjs[i].Email, client_id);
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
 * Edit
 ***********************************************************/
// Edit client
router.post("/edit-client", async (req, res) => {
    try {
        const formData = req.body.data;
        const params = new URLSearchParams(formData);
        const id = req.body.id;
        const name = params.get('name');
        const company = params.get('company');
        const telephone = params.get('telephone');
        const mobile = params.get('mobile');
        const email = params.get('email');
        const street = params.get('street');
        const suburb = params.get('suburb');
        const city = params.get('city');
        const pc = params.get('pc');

        await clients.editClient(id, name, company, telephone, mobile, email, street, suburb, city, pc);
        res.status(201).end();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST edit note
router.post("/edit-note", async (req, res) => {
    try {
        const formData = req.body.data;
        const params = new URLSearchParams(formData);
        const note = params.get('note');
        const id = req.body.id;

        await clients.editNote(id, note);
        res.status(201).end();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

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
router.delete("/delete-client", async (req, res) => {
    try {
        await clients.deleteClient(req.body.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delets a note from db
router.delete("/delete-note", async (req, res) => {
    try {
        await clients.deleteNote(req.body.nId);
        res.status(204).end();
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

/***********************************************************
 * Helper functions
 ***********************************************************/
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