const validator = require("validator");
const sanitizeHtml = require("sanitize-html");

function sanitizeString(value) {
  if (!value) return value;
  const trimmed = validator.trim(value);
  const clean = sanitizeHtml(trimmed);
  return validator.escape(clean);
}

module.exports = { sanitizeString };
