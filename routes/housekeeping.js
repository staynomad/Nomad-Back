/* BASE PATH: /housekeeping */

const { Router } = require("express");
const router = Router();
const Housekeeping = require("../controllers/housekeeping.controller");

/*
INPUT:
  name (params) - string name of desired payload - either users or listings
DESCRIPTION:
  gets timeseries housekeeping payload data
*/
router.get("/:name", Housekeeping.getName);

module.exports = router;
