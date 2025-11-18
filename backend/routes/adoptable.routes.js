const { Router } = require("express");
const adoptableController = require("./../controllers/adoptable.controller");

const router = new Router();

// /api/adoptables/
router.get("/", adoptableController.getAdoptables);

module.exports = router;
