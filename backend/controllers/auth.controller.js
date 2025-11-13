// const { AuthWeakPasswordError } = require("@supabase/supabase-js");
const User = require("./../models/user.model");
const newUserSchema = require("../validation/registrationDataValidation");
const loginDetailSchema = require("../validation/loginDataValidation");
// const { sanitizeString } = require("../utils/auth.js");

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
    const { user_id, error } = await user.login();
    if (error) {
      return res.json({ msg: error });
    }
    res.json({ success: true });
  } catch (err) {
    console.log("User Login Falied");
    next(err);
  }
}

function getAuthGoogleCallback(req, res) {
  req.session.user = req.user;
  console.log(req.user);
  // res.send(`<h2>Wecome ${req.user.displayName}</h2>`);
  res.redirect("/home");
}

// function logout(req, res, next) {
//   console.log("Logging out user");
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//     // destroy the session to fully log the user out
//     req.session.destroy(function (err) {
//       // ignore session destroy errors and redirect to login
//       res.redirect("/login");
//     });
//   });
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
  getAuthGoogleCallback,
  // logout,
  // getRegister,
  register,
  // getForgotPassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
