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

  password: Joi.string().required().label("Password").messages({
    "string.empty": "{#label} is required",
    "any.required": "{#label} is required",
  }),
});

module.exports = newPetSchema;
