
const router = require("express").Router();

router.use("/users", require("./users"));
router.use("/oauth",require("./oauth"));
module.exports = router;