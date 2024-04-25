const router = require("express").Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/redirect', passport.authenticate('google', { session: false, failureRedirect: `https://localhost:3000/login` }), (req, res) => {
    res.redirect(req.user); //req.user has the redirection_url;
});

//Microsoft 
router.get('/microsoft', passport.authenticate('microsoft', { session: false }));
router.get('/microsoft/redirect', passport.authenticate('microsoft', { session: false, failureRedirect: `https://localhost:3000/login` }), (req, res) => {
    res.redirect(req.user); //req.user has the redirection_url;
});

module.exports = router;