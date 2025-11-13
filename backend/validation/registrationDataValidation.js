const JoiBase = require("joi");
const { sanitizeString } = require("../utils/auth.js");

const Joi = JoiBase.defaults((schema) =>
  schema.options({ errors: { wrap: { label: false } } })
);

newUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(30)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .label("Name")
    .custom(sanitizeString)
    .messages({
      "string.empty": "{#label} is required",
      "string.min": "{#label} must be at least {#limit} characters long",
      "string.max": "{#label} must be less than {#limit} characters long",
      "any.required": "{#label} is required",
      "string.pattern.base": "{#label} is invalid",
    }),

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

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .label("Confirm Password")
    .messages({
      "any.only": "{#label} must match Password",
      "string.empty": "{#label} is required",
      "any.required": "{#label} is required",
    }),

  role: Joi.string()
    .valid("none", "adopter", "giver", "both", "admin")
    .default("adopter")
    .label("Role")
    .custom(sanitizeString)
    .messages({
      "any.only": "{#label} must be one of: adopter, giver, or admin",
    }),
});

module.exports = newUserSchema;
