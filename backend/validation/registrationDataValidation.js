const JoiBase = require("joi");
const { sanitizeString } = require("../utils/auth.js");

const Joi = JoiBase.defaults((schema) =>
  schema.options({ errors: { wrap: { label: false } } })
);

const registrationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .label("Name")
    .custom(sanitizeString)
    .messages({
      "string.empty": "{#label} is required",
      "string.min": "{#label} must be at least {#limit} characters long",
      "string.pattern.base": "{#label} can only contain letters and spaces",
    }),

  email: Joi.string()
    .custom(sanitizeString)
    .email()
    .max(100)
    .required()
    .label("Email")
    .messages({
      "string.empty": "{#label} is required",
      "string.email": "Please enter a valid {#label}",
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .label("Password")
    .messages({
      "string.pattern.base":
        "{#label} must include uppercase, lowercase, and a number",
    }),
});

module.exports = registrationSchema;
