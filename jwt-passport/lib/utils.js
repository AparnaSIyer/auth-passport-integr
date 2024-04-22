const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
/**
 * HELPER FUNCTIONS
 */

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
    var generatedHash = generateHash(password, salt,);

    return hash === generatedHash;
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

function generatePassword(password) {
    var salt = crypto.randomBytes(32).toString("hex");
    var generatedHash = generateHash(password, salt);

    return {
        salt: salt,
        hash: generatedHash
    }
}

function generateHash(password, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");
    return hashVerify;
}

const pathToPrivateKey = path.join(__dirname, "..", "test_key.pem");
const PRIVATE_KEY = fs.readFileSync(pathToPrivateKey, "utf-8");

function signJWT(user) {
    const _id = user._id;
    
    const expirationTime = "1d";

    const payload = {
        sub: _id,
        iat: Date.now()
    }

    const signedJWToken = jsonwebtoken.sign(payload, PRIVATE_KEY, {
        expiresIn: expirationTime,
        algorithm: "RS256"
    });

    return {
        token: `Bearer ${signedJWToken}`,
        expiresIn: expirationTime
    }
}

module.exports = {validPassword, generatePassword, signJWT};