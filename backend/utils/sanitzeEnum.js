/**
 * Ensures a value matches a list of allowed ENUM values.
 * @param {string} value - Incoming value from request
 * @param {Array} allowed - Array of allowed strings from DB schema
 * @param {string} defaultValue - Fallback value
 */
function sanitizeEnum(value, allowed, defaultValue) {
  if (!value || !allowed.includes(value)) {
    return defaultValue;
  }
  return value;
}

module.exports = sanitizeEnum;
