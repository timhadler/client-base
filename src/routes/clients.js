//const { response } = require("express");
const express = require("express");
const router = express.Router();
const db = require("./../database");

router.get("/:id", async (req, res) => {
    try {
        const sqlQuery = "SELECT * from Clients WHERE id=?";
        const rows = await db.query(sqlQuery, req.params.id);
        //res.status(200).render("client-lists.ejs");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get("/", (req, res) => {
    res.send("list");
});

module.exports = router;