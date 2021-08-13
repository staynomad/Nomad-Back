const { Router } = require("express");
const Housekeeping = require("../controllers/housekeeping.controller");

const router = Router();
router.get("/:name", Housekeeping.getName);

module.exports = router;
