const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");

const { passport }  = require("../passport-config");
const users = require("../models/user.models");
const stripeModule = require("./stripe");
const { logInfo, logError } = require('../config/logger');  

/***********************************************************
 * Get
 ***********************************************************/
router.get("/register", (req, res) => {
    res.render("login/register", { bodyClass: "authPage", showNavBar: false });
});

router.get("/login", (req, res) => {
    res.render("login/login", { bodyClass: "authPage", showNavBar: false });
});

/***********************************************************
 * Post
 ***********************************************************/
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
        let stripeID = null;

        // In development
        if (process.env.STRIPE_FEATURE === 'enabled') {
            stripeID = await stripeModule.createCustomer(email)
            const subscriptionID = await stripeModule.createTrialSubscription(stripeID);    // Stripe webhook will handle updating subscription details in db

            // Create user
            if (stripeID) {
                await users.createUser(email, hashedPassword, stripeID);
            } else {
                throw new Error("Error creating user. Please try again.");
            }
        } else {
            await users.createUser(email, hashedPassword, stripeID);
        }

        logInfo('User registerd', {
            stripeId: stripeID
        })

        res.redirect("/auth/login");
    } catch (error) {
        let message = "An unexpected error occured. Please try again later.";

        if (error.message.includes("Duplicate entry")) {
            message = "User already exists";

        } else if (error.message.includes("Invalid email address")) {
            message = "Invalid email address";

        } else if (error.message.includes("Password must")) {
            message = error.message;
        } else {
            logError('Error registering user', error, req, {
                email: req.body.email
            })
            res.status(500);
        }
        res.render("login/register", { bodyClass: "authPage", showNavBar: false, error: message });
    }
});

router.post("/login", (req, res, next) => {
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


/***********************************************************
 * Delete
 ***********************************************************/
router.delete("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/auth/login");
    });
});

module.exports = router;