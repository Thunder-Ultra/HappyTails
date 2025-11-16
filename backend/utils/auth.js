require("dotenv").config({
  path: "./jwtSecret.env",
  quiet: true,
});
const jwt = require("jsonwebtoken");
const validator = require("validator");
const sanitizeHtml = require("sanitize-html");

function sanitizeString(value) {
  if (!value) return value;
  const trimmed = validator.trim(value);
  const clean = sanitizeHtml(trimmed);
  return validator.escape(clean);
}

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

module.exports = { sanitizeString, generateToken };
