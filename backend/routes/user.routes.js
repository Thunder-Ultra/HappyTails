const { Router } = require("express");
const baseController = require("./../controllers/user.controller");
// const checkAuthMiddleware = require("./../middlewares/checkAuthMiddleware");

const router = Router();

// router.use(checkAuthMiddleware);

router.get("/me", baseController.getMe);

module.exports = router;
