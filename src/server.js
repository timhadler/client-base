require("dotenv").config();

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const override = require("method-override");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const passport  = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const initializePassport = require("./passport-config");
initializePassport(
    passport,
    getUserByName,
    getUserById
);

const clients = require("./models/client-models");
const indexRouter = require("./routes/index");
const clientRouter = require("./routes/clientDetails");
const { Passport } = require("passport/lib");
const req = require("express/lib/request");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static(path.join("public")));
app.use(override("_method"));
app.use(bodyParser.urlencoded( {extended: false } ));

app.use(flash());
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
 }));
 app.use(passport.initialize());
 app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * Routes
 */
app.use("/", indexRouter);
app.use("/clients", checkAuthenticated, clientRouter);
//app.use("/clients", clientRouter);

app.listen(process.env.PORT);
console.log("Listening on port: " + process.env.PORT);


// Logins
app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("login/register");
});

app.post("/register", async (req, res) => {
    try {
        const body = req.body;
        const register = await clients.getUserByUsername(body.registerCode);

        if (register == null) {
            const error = "Incorrect register code";
            res.render("login/register", { error:error });
        } else {
            const hashedPassword = await bcrypt.hash(body.password, 10);
            await clients.creatUser(body.username, hashedPassword);
            await clients.deleteUser(register.id);
            res.redirect("/login");
        }
    } catch (error) {
        // If error was caused by a duplicate username
        if (error.message.includes("Duplicate entry")) {
            const error = "User already exists";
            res.render("login/register", {error:error});
        } else {
            res.status(400).send(error.message);
        }
    }
});

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login/login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

app.delete("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
});

// Helpers
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }

    next();
};

async function getUserById(id) {
    try {
        return await clients.getUserById(id);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

async function getUserByName(username) {
    try {
        return await clients.getUserByUsername(username);
    } catch (error) {
        res.status(500).send(error.message);
    }
};