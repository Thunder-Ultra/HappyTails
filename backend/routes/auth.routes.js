const { Router } = require("express");
const authController = require("./../controllers/auth.controller");
const passport = require("passport");

const router = Router();

router.post("/login", authController.login);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
); // ?

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.getAuthGoogleCallback
);

// router.get("/register", authController.getRegister);

router.post("/register", authController.register);

// router.get("/forgotpassword", authController.getForgotPassword);

router.post("/forgotpassword", authController.forgotPassword);
router.post("/verifyotp", authController.verifyOtp);
router.post("/resetpassword", authController.resetPassword);

// router.post("/resetpassword", authController.resetPassword);

module.exports = router;
