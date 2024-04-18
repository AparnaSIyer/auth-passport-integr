const express = require('express');
const mongoose = require('mongoose')
// passport allows the application to maintain a session with the already authenticated users(an authorization mechanism)
const passport = require('passport');
const session = require('express-session');
const localStrategy = require('passport-local').Strategy
var crypto = require("crypto");
const MongoStore = require("connect-mongo")(session);
require('dotenv').config();

const app = express();

const connection = mongoose.createConnection(process.env.DB_URI);

const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String
})

mongoose.model("User", UserSchema);
const sessionStore = new MongoStore({
    mongooseConnection: connection,
    collection: "sessions"
});

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        store: sessionStore
    })
)

//we will write functions pertaining to passport 


passport.use(
    new LocalStrategy(function (username, password, cb) {
        User.findOne({ username: username }).then((user) => {
            if (!user) {
                return cb(null, false);
            }

            const isValid = validPassword(password, user.hash, user.salt);

            if (isValid) {
                return cb(null, user);
            } else {
                return cb(null, false);
            }
        })
            .catch((err) => {
                cb(err);
            });
    })
);


passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    User.findByUserId(id, function(err, user){
        if(err){
            return cb(err);
        }

        cb(null, user);
    });
});

//to import the secondary authentication library 
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(passport.session())

/**
 *
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");

    return hash === hashVerify;
}

/**
 *
 * @param {*} password - The password string that the user inputs to the password field in the register form
 *
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 *
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later (similar to what we do here)
 */
function generateHashedPassword(password) {
    var salt = crypto.randomBytes(32).toString("hex");
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");

    return {
        salt,
        hash: genHash
    }
}

//Ends all related to passport 

