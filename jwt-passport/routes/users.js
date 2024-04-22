const router = require("express").Router();
const passport = require('passport');
const { register, login, protectedMethod } = require("../controllers/user.controller");

router.post("/login", login);
router.post("/register",register);
router.get("/surakshit",passport.authenticate("jwt", {session: false}), protectedMethod)
module.exports = router;