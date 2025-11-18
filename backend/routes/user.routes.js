const { Router } = require("express");
const userController = require("./../controllers/user.controller");
// const checkAuthMiddleware = require("./../middlewares/checkAuthMiddleware");

const router = Router();

// router.use(checkAuthMiddleware);

router.get("/me", userController.getMe);

router.put("/me", userController.setMe);

module.exports = router;
