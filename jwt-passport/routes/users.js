const router = require("express").Router();
const { register } = require("../controllers/user.controller");

router.post("/login", (req, res, next) => { });
router.post("/register",register);

module.exports = router;