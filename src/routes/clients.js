const express = require("express");
const router = express.Router();
const clients = require("../models/client-models");
xl = require("../modules/excel-JS");
const multer = require('multer');                   // For uploading files
const upload = multer({ dest: "uploads/" });

// Client Index
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
            user: req.user // Assuming you have user authentication
        });
    } catch {
        res.status(500).send(error.message);
    }
});

// GET - Show edit client form
router.get('/:id/edit', async (req, res) => {
    try {
        const client = await clients.getClientDetails(req.params.id);

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
        console.error('Error loading client:', error);
        req.flash('error', 'Failed to load client');
        res.redirect('/clients');
    }
});

// Usefull error catcthing for development
// console.error('Error:', error); // Logs full error stack - REMOVE IN PRODUCTION
// res.status(500).json({
//     message: error.message,   // Shows the error message
//     stack: error.stack        // Shows stack trace for debugging
// });

// Load client list
router.get("/load-client-list", async (req, res) => {
    try {
        const limit = req.query.limit;
        const offset = req.query.offset;
        const search = req.query.search;
        const status = req.query.status;
        const priority = req.query.priority;

        const nClients = await clients.nTotalClients();
        const clientList = await clients.getClientList(limit, offset, search, status, priority);

        res.json({ clientList:clientList, nClients:nClients });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/:id", async (req, res) => {
    try {
        res.status(200).render("clients/client-details", { bodyClass: "", clientId: req.params.id, showNavBar: true });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/:id/data", async (req, res) => {
    try {
        const id = req.params.id;;
        const client = await clients.getClientDetails(id);

        // Format dates
        // if(client) {
        //     client.createdAt = new Date(client.createdAt).toISOString();
        //     client.lastContact = client.lastContact ? new Date(client.lastContact).toISOString() : null;
        // }

        res.json({ client:client });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/:id/reminders", async (req, res) => {
    try {
        const id = req.params.id;
        const {limit} = req.body;

        let reminders = await clients.getClientReminders(id);

        // Filter out completed reminders
        reminders = reminders.filter(reminder => reminder.status !== "complete"); 

        res.json({ reminders:reminders });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/:id/activity", async (req, res) => {
    try {
        const id = req.params.id;
        const {limit} = req.body;

        let interactions = await clients.getClientInteractions(id);

        res.json({ interactions:interactions });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/***********************************************************
 * Add
 ***********************************************************/
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        //const address = data.address || {};

        // Construct client object
        const newClient = {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone || null,
            company: data.company,
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

        const clientId = await clients.addClient(newClient);
        const publicIdObj = await clients.getPublicId(clientId);
        console.log(data.city);

        // Optional reminder if selected
        if (data.setReminder === 'yes' && data.reminderDate) {
            const note = "Initial reminder";
            const important = false;                // PLACEHOLDER
            await clients.createReminder(data.reminderDate, important, note, publicIdObj.public_id);
        }

        // Respond for AJAX
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ success: true, redirectUrl: `/clients/${ publicIdObj.public_id}` });
        }

        res.redirect(`/clients/${ publicIdObj.public_id}`);
    } catch (error) {
        console.error('Error adding client:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ error: 'Somethign went wrong, but client may have been created. Try searching for them.' });
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

// POST edit reminder (popup)
router.post("/edit-reminder", async (req, res) => {
    try {
        const formData = req.body.data;
        const params = new URLSearchParams(formData);
        const rDate = params.get('rDate');
        const status = params.get('status');
        const id = req.body.id;

        //await clients.editClientReminder(id, rDate, status)
        res.status(201).end();
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

// Delete from reminders table
router.delete("/delete-reminder", async (req, res) => {
    try {
        await clients.deleteClientReminder(req.body.id);
        res.status(204).end();
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
// function convertDate(date) {
//     if (typeof date == 'undefined') {
//         return null;
//     }

//     let s = date.split('-');
//     if (s.length != 3) {
//         s = date.split('/');
//     }
//     if (s.length != 3) {
//         return null;
//     }

//     let day = s[0];
//     let month = s[1];
//     const year = s[2];

//     if (day.length == 1) {
//         day = '0' + day;
//     }
//     if (month.length == 1) {
//         month = '0' + month;
//     }

//     // const day = date.slice(0, 2);
//     // let month = date.slice(3, 6);
//     // const year = date.slice(7, 11);

//     switch(month) {
//         case ("Jan"): 
//             month = "01";
//             break;
//         case ("Feb"): 
//             month = "02";
//         break;
//         case ("Mar"): 
//             month = "03";
//             break;
//         case ("Apr"): 
//             month = "04";
//             break;
//         case ("May"): 
//             month = "05";
//             break;
//         case ("Jun"): 
//             month = "06";
//             break;
//         case ("Jul"): 
//             month = "07";
//             break;
//         case ("Aug"): 
//             month = "08";
//             break;
//         case ("Sep"): 
//             month = "09";
//             break;
//         case ("Oct"): 
//             month = "10";
//             break;
//         case ("Nov"): 
//             month = "11";
//             break;
//         case ("Dec"): 
//             month = "12";
//             break;
//     }
//     const nDate = year + "-" + month + "-" + day
//     return nDate;
// }

module.exports = router;