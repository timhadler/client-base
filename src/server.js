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
const MemoryStore = require('memorystore')(session);

const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await clients.getUserByUsername(username);
            if (!user) {
                return done(null, false, {message: "No user with that username"});
            }
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user.id);
            } else {
                return done(null, false, {message: "Incorrect password"});
            }
        } catch (error) {
            console.log("Error serializing user", error);
        }
    }
));

passport.serializeUser((userId, done) => {
    done(null, userId);
});

passport.deserializeUser(async (userId, done) => {
    try {
        const user = await clients.getUserById(userId);
        const obj = { id: user.id, username: user.username, pool: "Something funny goes here" }
        done(null, obj);
    } catch (error) {
        console.log("Error deserializing user: ", error)
        done(error, null);
    }
});

const clients = require("./models/client-models");
const indexRouter = require("./routes/reminders");
const clientRouter = require("./routes/clients");
const overviewRouter = require("./routes/clientOverview");
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
    saveUninitialized: false,
    cookie: {maxAge:86400000}, // one day
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      })
 }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.delete("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/login");
    });
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

/**
 * Routes
 */
app.use("/", checkAuthenticated, indexRouter);
app.use("/clients", checkAuthenticated, clientRouter);
app.use("/clientOverview", checkAuthenticated, overviewRouter);

// app.use("/", indexRouter);
// app.use("/clients", clientRouter);
// app.use("/clientOverview", overviewRouter);