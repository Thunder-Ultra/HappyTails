const { Router } = require("express");
const baseController = require("./../controllers/base.controller");
const checkAuthMiddleware = require("./../middlewares/checkAuthMiddleware");

const router = Router();

router.use(checkAuthMiddleware);

router.get("/pets", baseController.getHome);

module.exports = router;
