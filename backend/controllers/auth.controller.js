const userModel = require("./../models/user.model");

async function getLogin(req, res) {
  console.log("Accessed the login Page");
  // console.log(req.session);
  // req.session.data = { accessed: true };
  // const response = await userModel.findUserByEmail("dastuchar@gmail.com");
  // console.log(response);
  res.render("login");
}

function login(req, res) {
  // Get user credintials from the body
  const { email, password } = req.body;
  // Check if the email and password is empty
  if (!email || !password) {
    return res.redirect("/login");
  }
  // Validate the credintials
  // Redirect to Login Page if credintials are invalid
  // Redirect to the Hompage if credintials are valid
  res.redirect("/");
}

function getAuthGoogleCallback(req, res) {
  req.session.user = req.user;
  console.log(req.user);
  // res.send(`<h2>Wecome ${req.user.displayName}</h2>`);
  res.redirect("/home");
}

function logout(req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // destroy the session to fully log the user out
    req.session.destroy(function (err) {
      // ignore session destroy errors and redirect to login
      res.redirect("/login");
    });
  });
}

function getRegister(req, res) {
  res.render("register");
}

function register(req, res) {
  res.redirect("/login");
}

function getForgotPassword(req, res) {
  res.render("forgot_password");
}

function forgotPassword(req, res) {
  res.render("forgot_password");
}

module.exports = {
  getLogin,
  login,
  getAuthGoogleCallback,
  logout,
  getRegister,
  register,
  getForgotPassword,
  forgotPassword,
};
