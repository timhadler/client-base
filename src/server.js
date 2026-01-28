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

// Routes
const reminderRouter = require("./routes/reminders");
const clientRouter = require("./routes/clients");
const authRouter = require("./routes/auth");
const stripeRouter = require("./routes/stripe");
const interactionsRouter  =require("./routes/interactions");

const { passport, autoLoginDev } = require("./passport-config");
const { logInfo, logError } = require("./config/logger");

// Setup folder structure
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

// Middleware
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

// Allow flash in templates
 app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Helmet security headers
app.use(helmet());

 // Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(autoLoginDev);

// Custom Middleware
// Authentication
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/auth/login");
};

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/reminders");
    }
    next();
};

// Authorization
function checkTrialorActive(req, res, next) {
    if (!req.user) { return res.redirect("/auth/login"); }
    if (req.user.subscription_status === "trialing" || req.user.subscription_status === "active") {
        return next();
    }
    return res.redirect("/subscriptions"); // portal page
};

function checkActivePaid(req, res, next) {
    if (!req.user) { return res.redirect("/auth/login"); }
    if (req.user.subscription_status !== "active") {
        return res.redirect("/subscriptions"); // portal page
    }
    next();
};

/**
 * Routes
 */
app.use("/subscriptions", stripeRouter);
app.use(express.json());    // Call before routes to parse JSON bodies, call after subscriptions route as webhooks need raw body

// Mount routers
app.use("/auth", authRouter);
app.use("/reminders", checkAuthenticated, reminderRouter);
app.use("/clients", checkAuthenticated, clientRouter);
app.use('/interactions', checkAuthenticated, interactionsRouter);

// Global error handler (doesnt inlcude async errros)
app.use((err, req, res, next) => {
    logError('Uncaught Error', err, req);

    if (!res.headersSent) {
        req.flash('error', 'Something went wrong');
        res.status(500).redirect('/reminders');
    }
});

// Start server
app.listen(process.env.PORT);
logInfo(`Listening on port: ${process.env.PORT}, in environment: ${process.env.NODE_ENV}`);