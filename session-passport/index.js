const express = require('express');
const mongoose = require('mongoose')
// passport allows the application to maintain a session with the already authenticated users(an authorization mechanism)
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy
var crypto = require("crypto");
const MongoStore = require("connect-mongo")(session);
require('dotenv').config();

const app = express();

const connection = mongoose.createConnection(process.env.DB_URI);

const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String
});

const User = connection.model("User", UserSchema);

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


/**
 *  these two functions are responsible for "serializing" and "deserializing" users to and from the current session object.
 */
passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    User.findById(id, function (err, user) {
        if (err) {
            return cb(err);
        }

        cb(null, user);
    });
});

const sessionStore = new MongoStore({
    mongooseConnection: connection,
    collection: "sessions"
});

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
        cookie: {
            maxAge: 1000 * 30,
        },
    })
);
//to import the secondary authentication library 
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

/**
 * APP ROUTES
 */

app.get("/", (req, res, next) => {
    res.send("<h2>HOME</h2>");
});

app.get("/login", (req, res, next) => {
    const form = '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>'
    res.send(form);
});

app.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login-failure",
        successRedirect: "login-success",
    }),
    (err, req, res, next) => {
        if (err) next(err);
    }
);

app.get("/register", (req, res, next) => {
    const form = '<h1>Register Page</h1><form method="post" action="register">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);
});

app.post("/register", (req, res, next) => {
    const saltedHash = generateHashedPassword(req.body.password);

    const salt = saltedHash.salt;
    const hash = saltedHash.hash;

    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt,
    });

    newUser.save().then((user) => {
        // console.log(user);
    });

    res.redirect("/login");
});

app.get("/protected-route", (req, res, next) => {
    if (req.isAuthenticated()) {
        res.send("<h1> You are authenticated </h1>");
    } else {
        res.send("<img src='https://indianmemetemplates.com/wp-content/uploads/chabi-kaha-hai-1024x576.jpg'>")
    }
});

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err) }
        res.redirect("/login");
    });
});

app.get("/login-success", (req, res, next) => {
    res.send("You successfully logged in.");
});

app.get("/login-failure", (req, res, next) => {
    res.send("You entered the wrong password.");
});
/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(process.env.PORT_SESSION, () => {
    console.log("Listening to port " + process.env.PORT_SESSION);
});


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

