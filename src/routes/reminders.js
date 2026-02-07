const express = require("express");
const router = express.Router(); 

/***********************************************************
 * Get
 ***********************************************************/
router.get("/", async (req, res) => {
    res.render("reminders/reminders", {
        bodyClass:"mainPage", 
        username: req.user.username, 
        showNavBar:true
    });
});

module.exports = router;