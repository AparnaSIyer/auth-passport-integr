const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const fs = require("fs");
const path = require("path");
const User = require('../models/user');

//Passport comes in, this file allows in the verification of the user in our database


const pathToPublicKey = path.join(__dirname, "..", "test_key_pub.pem");

/**
 * we can synchronously read files, i.e. we are telling node.js 
 * to block other parallel processes and do the current file reading process.
 */
const PUB_KEY = fs.readFileSync(pathToPublicKey, "utf-8");

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ["RS256"]
}


// the below function will be executed on every route where we are doing passport.authenticate(), 
// and luckily passport will verify the jwt internally through the jsonwebtoken library 
module.exports = (passport) => {
    passport.use(
        new JwtStrategy(options, function (jwt_payload, done) {
            User.findOne({ _id: jwt_payload.sub }, function (err, user) {
                if (err) {
                    return done(err, false);
                }

                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }));
}
