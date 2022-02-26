require("dotenv").config();

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const override = require("method-override");
const bodyParser = require("body-parser");

const indexRouter = require("./routes/index");
const clientRouter = require("./routes/clientDetails");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static(path.join("public")));
app.use(override("_method"));
app.use(bodyParser.urlencoded( {extended: false } ));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * Routes
 */
app.use("/", indexRouter);
app.use("/clients", clientRouter);

app.listen(process.env.PORT || 3000);