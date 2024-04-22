
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

function login(req, res, next) {
    User.findOne({ username: req.body.username })
        .then((user) => {
            if (!user) {
                res.status(401).json({ success: false, msg: "could not find user" });
            }

            //below line of codes checks whether password is correct or not

            const isValid = utils.validPassword(
                req.body.password,
                user.hash,
                user.salt
            );

            if (isValid) {
                const tokenObj = utils.signJWT(user);
                res.status(200).json({
                    success: true,
                    token: tokenObj.token,
                    expiresIn: tokenObj.expiresIn,
                })
            } else {
                res
                    .status(401)
                    .json({ success: false, msg: "you entered the wrong password" });
            }
        })
        .catch(err => {
            next(err);
        })
}

function protectedMethod(req, res, next) {
    res.status(200).json({
        success:true,
        msg: "आपने एक संरक्षित संसाधन तक पहुंच प्राप्त कर ली है|"
    })
}
module.exports = { register, login, protectedMethod }