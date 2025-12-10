const { Router } = require("express");
const authController = require("./../controllers/auth.controller");
// const passport = require("passport");

const router = Router();

router.post("/login", authController.login);

router.get("/google", authController.getAuthGoogle);

router.get("/google/callback", authController.getAuthGoogleCallback);

router.post("/register", authController.register);

router.post("/forgot-password", authController.forgotPassword);

router.post("/verify-otp", authController.verifyOtp);

router.post("/reset-password", authController.resetPassword);

module.exports = router;
