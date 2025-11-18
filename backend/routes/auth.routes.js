const { Router } = require("express");
const authController = require("./../controllers/auth.controller");
// const passport = require("passport");

const router = Router();

router.post("/login", authController.login);

router.get("/auth/google", authController.getAuthGoogle);

router.get("/auth/google/callback", authController.getAuthGoogleCallback);

router.post("/register", authController.register);

router.post("/forgotpassword", authController.forgotPassword);

router.post("/verifyotp", authController.verifyOtp);

router.post("/resetpassword", authController.resetPassword);

module.exports = router;
