const express = require("express");
const router = express.Router();
const clientModels = require("../models/client.models");
const clientServices = require("../services/client.services");
xl = require("../modules/excel-JS");
const multer = require('multer');                   // For uploading files
const upload = multer({ dest: "uploads/" });

// Nested route
const interactionsRouter = require("./interactions");
//const { createReminder } = require("../models/client-models");
router.use("/:clientId/activity", interactionsRouter)

// GET - Client Index
router.get("/", async (req, res) => {
    try {
        res.status(200).render("clients/clients", { bodyClass: "clientsPage", showNavBar: true });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// GET - Show add client form
router.get('/new', (req, res) => {
    try {
        res.render('clients/client-form', {
            bodyClass: "",
            showNavBar: true,
            isEdit: false,
            client: {},
            user: req.user
        });
    } catch {
        res.status(500).send(error.message);
    }
});

// GET - Show edit client form
router.get('/:id/edit', async (req, res) => {
    try {
        const client = await clientModels.getClientDetails(req.params.id, req.user.id);

        if (!client) {
            req.flash('error', 'Client not found');
            return res.redirect('/clients');
        }

        res.render('clients/client-form', {
            bodyClass: "",
            showNavBar: true,
            isEdit: true,
            client: client,
            user: req.user
        });
    } catch (error) {
        req.flash('error', 'Failed to load client');
        res.redirect('/clients');
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

        res.status(200).json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// GET - Render client details page
router.get("/:id", async (req, res) => {
    try {
        res.status(200).render("clients/client-details", { 
            bodyClass: "", 
            clientId: req.params.id, 
            showNavBar: true 
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// GET - Retrieve client data
router.get("/:id/data", async (req, res) => {
    try {
        const id = req.params.id;;
        const client = await clientModels.getClientDetails(id, req.user.id);

        res.status(200).json({ client:client });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// GET - Retrieve client reminder data
router.get("/:id/reminders", async (req, res) => {
    try {
        const reminders = await clientServices.getActiveReminders(req.params.id, req.user.id);

        res.status(200).json({ reminders:reminders });
    } catch (error) {
        res.status(500).send(error.message);
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
            return res.json({ success: true, redirectUrl: `/clients/${ id}` });
        }

        res.redirect(`/clients/${ id }`);
    } catch (error) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ error: 'Somethign went wrong. Please try again.' });
        }
        res.redirect('/clients');
    }
});


/***********************************************************
 * Import clients
 ***********************************************************/
// router.post("/import-clients", upload.single("importExcel"), async (req, res) => {
//     try {
//         // Verifying file
//         const mandatoryExcelHeaders = ['Full name', 'Company', 'Email address', 'Mobile', "Phone", 'Street', 'Suburb', 'City', 'Postcode', 'Reminder date'];

//         if (req.file == null) {
//             res.redirect("/clients/import-clients");
//         } else {
//             let n = 0;              // number of succesful client uploads
//             let fails = [];         // List of clients that resulted in error and the error message, list of objects
//             let duplicates = [];    // List of clients that failed due to a duplicate name error
//             let noReminderDate = [];
//             let incorrectReminders = [];
//             let clientObjs = [];

//             try {
//                 clientObjs = xl.readData(req.file.originalname, (req.file.path), mandatoryExcelHeaders);
//             } catch (error) {
//                 let message = error.message;
//                 if (message.includes("no such file or directory")) {
//                     message = "No such file or directory.";
//                 }
//                 res.render("clients/importClients", {error:message});
//                 return;
//             }

//             let clientNumber = clientObjs.length;
//             for (let i = 0; i < clientNumber; i++) {
//                 const name = clientObjs[i]["Full name"];
//                 let company = clientObjs[i].Company;
//                 const rDate = clientObjs[i]["Reminder date"];
//                 let street = clientObjs[i].Street;
//                 let suburb = clientObjs[i].Suburb;
//                 let city = clientObjs[i].City;
//                 let postcode = clientObjs[i].Postcode;
//                 let email = clientObjs[i]["Email address"];
//                 let mobile = clientObjs[i].Mobile;
//                 let home = clientObjs[i].Phone;

//                 // Handle empty fields
//                 if (name.trim().length == 0) { fails.push({name:("Client (index: " + (i + 2) + ") failed upload"), message:"No name provided"}); continue;};   // If no name was provided, push to fails list
//                 if (home.length == 0) {home=null};
//                 if (mobile.length == 0) {mobile=null};
//                 if (city.length == 0) {city=null};
//                 if (email.length == 0) {email=null};
//                 if (postcode.length == 0) {postcode=null};
//                 if (suburb.length == 0) {suburb=null};
//                 if (street.length == 0) {street=null};
//                 if (company.length == 0) {company=null};
//                 //console.log(name, company, rDate, street, suburb, city, postcode, mobile, home)

//                 try {
//                     const client_id = await clients.createClient(name, company, home, mobile, email, street, suburb, city, postcode);
//                     n++;
//                     // Check for duplicates
//                     const dups = await clients.getClientsByName(name);
//                     if (dups.length > 1 && !duplicates.includes(name)) {
//                         duplicates.push(name);
//                     }
//                     await clients.createReminder(convertDate(rDate), "pending", client_id);
//                 } catch (error) {
//                     if (error.message.includes("Incorrect date value") || error.message.includes("Column 'rDate' cannot be null")) {
//                         noReminderDate.push(name);
//                         continue;
//                     } else if (error.message.includes("date.slice is not a function") || error.message.includes("date.split is not a function")) {
//                         incorrectReminders.push(name);
//                         continue;
//                     } else {
//                         fails.push({name:name, message:error.message});
//                         continue;
//                     }
//                 }
//             }
//             res.status(200).render("clients/importClients", {successes:n, total:clientNumber, fails:fails, duplicates:duplicates, noReminderDate:noReminderDate, incorrectReminders:incorrectReminders});
//         }
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

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
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ error: 'Error updating client' });
        }
        res.redirect('/clients');
    }
});

// POST edit reminder (popup)
// router.post("/edit-reminder", async (req, res) => {
//     try {
//         const formData = req.body.data;
//         const params = new URLSearchParams(formData);
//         const rDate = params.get('rDate');
//         const status = params.get('status');
//         const id = req.body.id;

//         //await clients.editClientReminder(id, rDate, status)
//         res.status(201).end();
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

/***********************************************************
 * Delete
 ***********************************************************/
// DELETE - Delete client data including remaining active reminders
router.delete("/:id", async (req, res) => {
    try {
        await clientServices.deleteClientData(req.params.id, req.user.id)

        res.status(204).end();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;