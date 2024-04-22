const express = require("express");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
require('./config/passport')(passport)
require("dotenv").config();

// Create the Express application
var app = express();

require("./config/database");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
// Allows our Angular application to make HTTP requests to Express application
app.use(cors());

// app.use(express.static(path.join(__dirname, "public")));

/**
 * ROUTES FOR THE APP
 */


app.use(require('./routes'));

// Listen to the server 
app.listen(process.env.PORT_JWT, () => {
    console.log("Listening to port " + process.env.PORT_JWT);
});
