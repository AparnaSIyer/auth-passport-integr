const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    callbackURL: 'http://localhost:5000/oauth/google/redirect',
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    passReqToCallback   : true
}, async(accessToken, refreshToken, profile, done)=>{
    
}))
