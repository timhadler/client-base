const express = require('express');
const router = express.Router();
const passport  = require("../passport-config");
const db = require("../database");

// Logins
router.get("/register", (req, res) => {
    res.render("login/register");
});

router.post("/register", async (req, res) => {
    try {
        const body = req.body;
        const register = await clients.getUserByUsername(db.authPool, body.registerCode);

        if (register == null) {
            const error = "Incorrect register code";
            res.render("login/register", { error:error });
        } else {
            const hashedPassword = await bcrypt.hash(body.password, 10);
            await clients.creatUser(db.authPool, body.username, hashedPassword);
            await clients.deleteUser(db.authPool, register.id);
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

router.get("/login", (req, res) => {
    res.render("login/login");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.delete("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/login");
    });
});

module.exports = router;