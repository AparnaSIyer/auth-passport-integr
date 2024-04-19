const mongoose = require("mongoose");
const router = require("express").Router();
const User = mongoose.model("User");
const utils = require("../lib/utils");


router.post("/login", (req, res, next) => { });
router.post("/register", (req, res, next) => {
    const saltedHash = utils.generatePassword(req.body.password);
    const salt = saltedHash.salt;
    const hash = saltedHash.hash;

    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt,
    });

    try {
        newUser.save().then((user) => {
            res.json({success: true, user: user});
        });
    } catch (error) {
        res.json({success: false, msg: error});
    }
});


module.exports = router;