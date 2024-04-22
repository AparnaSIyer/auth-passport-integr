
const utils = require("../lib/utils");
const User = require('../models/user');

function register(req, res, next) {
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
            res.status
            res.json({ success: true, user: user });
        });
    } catch (error) {
        res.json({ success: false, msg: error });
    }
}

module.exports = { register }