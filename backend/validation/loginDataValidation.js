const JoiBase = require("joi");
const { sanitizeString } = require("../utils/auth.js");

const Joi = JoiBase.defaults((schema) =>
  schema.options({ errors: { wrap: { label: false } } })
);

newUserSchema = Joi.object({
  email: Joi.string()
    .custom(sanitizeString)
    .email()
    .required()
    .label("Email")
    .messages({
      "string.empty": "{#label} is required",
      "string.email": "Please enter a valid {#label}",
      "any.required": "{#label} is required",
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .label("Password")
    .messages({
      "string.empty": "{#label} is required",
      "string.min": "{#label} must be at least {#limit} characters long",
      "string.max": "{#label} must be less than {#limit} characters long",
      "string.pattern.base":
        "{#label} must include at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "{#label} is required",
    }),
});

module.exports = newUserSchema;
