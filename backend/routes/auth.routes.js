const { Router } = require("express");
const authController = require("./../controllers/auth.controller");

const router = Router();

router.get("/login", authController.getLogin);

router.get("/register", authController.getRegister);

module.exports = router;
