const { Router } = require("express");
const authController = require("./../controllers/auth.controller");
const passport = require("passport");

const router = Router();

router.get("/login", authController.getLogin);

router.post("/login", authController.login);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.getAuthGoogleCallback
);

router.get("/logout", authController.logout);

router.get("/register", authController.getRegister);

router.post("/register", authController.register);

router.get("/forgotpassword", authController.getForgotPassword);

router.post("/forgotpassword", authController.forgotPassword);

module.exports = router;
