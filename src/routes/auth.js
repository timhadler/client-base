const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");

const { passport }  = require("../passport-config");
const users = require("../models/user-models");
const stripeModule = require("./stripe");

// GET
router.get("/register", (req, res) => {
    res.render("login/register", { bodyClass: "authPage", showNavBar: false });
});

router.get("/login", (req, res) => {
    res.render("login/login", { bodyClass: "authPage", showNavBar: false });
});

// POST
router.post("/register", async (req, res) => {
    try {
        const body = req.body;
        const email = body.email;
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

        // Create stripe customer and start a free subscription trial
        const stripeID = await stripeModule.createCustomer(email)
        const subscriptionID = await stripeModule.createTrialSubscription(stripeID);    // Stripe webhook will handle updating subscription details in db

        // Create user in db
        if (stripeID) {
            await users.createUser(email, hashedPassword, stripeID);
        } else {
            throw new Error("Error creating user. Please try again.");
        }

        res.redirect("/auth/login");
    } catch (error) {
        let message = "An unexpected error occured. Please try again later.";

        // If error was caused by a duplicate email
        if (error.message.includes("Duplicate entry")) {
            message = "User already exists";

        // If error was caused by invalid email format
        } else if (error.message.includes("Invalid email address")) {
            message = "Invalid email address";

        // If error was caused by invalid password
        } else if (error.message.includes("Password must") || error.message.includes("Error creating user")) {
            message = error.message;
        } else {
            res.status(400);
        }
        res.render("login/register", { bodyClass: "authPage", showNavBar: false, error: message });
    }
});

router.post("/login", (req, res, next) => {
  // If "Remember me" is checked, make session last longer (e.g. 30 days)
  if (req.body.remember) {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  } else {
    req.session.cookie.expires = false; // session cookie (expires on browser close)
  }

  passport.authenticate("local", {
    successRedirect: "/reminders",
    failureRedirect: "/auth/login",
    failureFlash: true
  })(req, res, next);
});


// DELETE
router.delete("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/auth/login");
    });
});

module.exports = router;