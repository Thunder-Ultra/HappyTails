// const { AuthWeakPasswordError } = require("@supabase/supabase-js");
require("dotenv").config({
  path: "./googlePassportCredintials.env",
  quiet: true,
});
const User = require("./../models/user.model");
const newUserSchema = require("../validation/registrationDataValidation");
const loginDetailSchema = require("../validation/loginDataValidation");
const { generateToken } = require("./../utils/auth");
const { OAuth2Client } = require("google-auth-library");
const { use } = require("passport");
const { func } = require("joi");

const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:4000/auth/google/callback"
);

async function register(req, res, next) {
  // console.log("Body:", req.body);

  const registrationData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role, // The Role part needs further Clarification :: TODO
  };
  // console.log("Before Sanitization:", registrationData);

  const { value: cleanRegistrationData, error } =
    newUserSchema.validate(registrationData);
  if (error) {
    return res.json({ msg: error.details[0].message });
  }

  // console.log(newUserSchema.validate(registrationData));
  // console.log(cleanRegistrationData);

  const userAlreadyExists = await User.findUserByEmail(
    cleanRegistrationData.email
  );
  // console.log(userAlreadyExists);
  if (userAlreadyExists) {
    return res.json({
      msg: "User already exists! Try login instead!",
    });
  }

  // console.log("After Sanitization:", registrationData);
  // return res.json({ msg: "User Registered" });

  // delete cleanRegistrationData.confirmPassword;

  const newUser = new User(cleanRegistrationData);

  try {
    const response = await newUser.register();
    // console.log(response);
    return res.json({ success: true, msg: "Registration Successful" });
  } catch (err) {
    console.log("User Registration Failed");
    next(err);
    // console.log(err);
    // return res.json({ msg: "Registration Failed" });
  }
  // res.redirect("/login");
}

async function login(req, res, next) {
  // Get user credintials from the body
  const loginData = { email: req.body.email, password: req.body.password };
  // Check if the email and password is empty
  const { value: cleanLoginData, error } =
    loginDetailSchema.validate(loginData);
  if (error) {
    return res.json({ msg: error.details[0].message });
  }
  // console.log(cleanLoginData); // Working
  // Validate the credintials
  const user = new User({
    email: cleanLoginData.email,
    password: cleanLoginData.password,
  });
  // Redirect to Login Page if credintials are invalid
  try {
    const { userId, error } = await user.login();
    if (error) {
      return res.json({ msg: error });
    }
    const token = generateToken(userId);
    res.json({ success: true, token });
  } catch (err) {
    console.log("User Login Falied");
    next(err);
  }
}

function getAuthGoogle(req, res) {
  const redirectUrl = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["profile", "email"],
  });

  res.redirect(redirectUrl);
}

async function getAuthGoogleCallback(req, res) {
  const code = req.query.code;

  const { tokens } = await client.getToken(code);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.CLIENT_ID,
  });

  // console.log("ticket :", ticket);

  const payload = ticket.getPayload();

  // console.log("payload :", payload);

  const token = generateToken({
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  });

  console.log(token);

  res.redirect(`http://localhost:5173/google-success?token=${token}`);
}

// function getAuthGoogleCallback(req, res) {
//   req.session.user = req.user;
//   console.log(req.user);
//   // res.send(`<h2>Wecome ${req.user.displayName}</h2>`);
//   res.redirect("/home");
// }

function forgotPassword(req, res) {
  // res.render("auth/forgotPassword");
}

function verifyOtp(req, res) {
  res.render("auth/verifyOtp");
}

function resetPassword(req, res) {
  res.redirect("/login");
}

module.exports = {
  // getLogin,
  login,
  getAuthGoogle,
  getAuthGoogleCallback,
  // logout,
  // getRegister,
  register,
  // getForgotPassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
