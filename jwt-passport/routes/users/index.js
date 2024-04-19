const mongoose = require("mongoose");
const router = require("express").Router();
const User = mongoose.model("User");


router.post("/login", (req, res, next) => { });
router.post("/register", (req, res, next) => { });


module.exports = router;