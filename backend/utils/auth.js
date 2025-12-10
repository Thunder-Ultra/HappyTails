require("dotenv").config({
  path: "./jwtSecret.env",
  quiet: true,
});
require("dotenv").config({
  path: "./serverURI.env",
  quiet: true,
});
const jwt = require("jsonwebtoken");
const validator = require("validator");
const sanitizeHtml = require("sanitize-html");
const { config } = require("dotenv");

function sanitizeString(value) {
  if (!value) return value;
  const trimmed = validator.trim(value);
  const clean = sanitizeHtml(trimmed);
  return validator.escape(clean);
}

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function redirectGoogleCallbackError(msg) {
  return res.redirect(
    `${
      process.env.FRONTEND_HOSTING_URI
    }/google-success?error=true&msg=${encodeURIComponent(message)}`
  );
}

module.exports = { sanitizeString, generateToken, redirectGoogleCallbackError };
