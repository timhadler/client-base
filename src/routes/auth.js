const express = require('express');
const router = express.Router();
const passport  = require("../passport-config");
const bcrypt = require("bcrypt");
const db = require("../database");
const clients = require("../models/client-models");

// GET
router.get("/register", (req, res) => {
    res.render("login/register");
});

router.get("/login", (req, res) => {
    res.render("login/login");
});

// POST
router.post("/register", async (req, res) => {
    try {
        const body = req.body;
        const password = body.password;

        if (password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
        if (!/[A-Z]/.test(password)) {
            throw new Error("Password must contain at least one uppercase letter");
        }
        if (!/[0-9]/.test(password)) {
            throw new Error("Password must contain at least one number");
        } 
        const hashedPassword = await bcrypt.hash(password, 10);

        await clients.creatUser(db.authPool, body.email, hashedPassword);
        res.redirect("/auth/login");
    } catch (error) {
        // If error was caused by a duplicate email
        if (error.message.includes("Duplicate entry")) {
            const error = "User already exists";
            res.render("login/register", {error:error});
        } else if (error.message.includes("Password must")) {
            res.render("login/register", {error:error.message});
        } else {
            res.status(400).send(error.message);
        }
    }
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/reminders",
    failureRedirect: "/auth/login",
    failureFlash: true
}));

// DELETE
router.delete("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/auth/login");
    });
});

module.exports = router;