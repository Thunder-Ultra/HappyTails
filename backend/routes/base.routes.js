const { Router } = require("express");
const baseController = require("./../controllers/base.controller");

const router = Router();

router.get("/home", baseController.getHome);

module.exports = router;
