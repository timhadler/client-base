require("dotenv").config();

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const override = require("method-override");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const helmet = require('helmet');

// Modules
const passport  = require("./passport-config");

// Routes
const reminderRouter = require("./routes/reminders");
const clientRouter = require("./routes/clients");
const overviewRouter = require("./routes/clientOverview");
const stripeRouter = require("./routes/stripe").router;
const authRouter = require("./routes/auth");

//const { Passport } = require("passport/lib");
//const req = require("express/lib/request");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static(path.join("public")));
app.use(override("_method"));
app.use(bodyParser.urlencoded( {extended: false } ));

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge:86400000}, // one day
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      })
 }));

// Helmet security headers
app.use(helmet());

 // Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.listen(process.env.PORT);
console.log("Listening on port: " + process.env.PORT);

// Helpers
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/auth/login");
};

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
};

/**
 * Routes
 */
app.use("/subscriptions", stripeRouter);
app.use(express.json());    // Call before routes to parse JSON bodys, call after subscriptions route as webhooks need raw body

// For Development purposes, disable authentication
app.use("/auth", authRouter);
app.use("/reminders", reminderRouter);
app.use("/clients", clientRouter);
app.use("/clientOverview", overviewRouter);

// app.use("/auth", checkNotAuthenticated, authRouter);
// app.use("/reminders", checkAuthenticated, reminderRouter);
// app.use("/clients", checkAuthenticated, clientRouter);
// app.use("/clientOverview", checkAuthenticated, overviewRouter);