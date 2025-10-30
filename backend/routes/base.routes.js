const { Router } = require("express");
const baseController = require("./../controllers/base.controller");

const router = Router();

router.get("/", baseController.getHome);

module.exports = router;
