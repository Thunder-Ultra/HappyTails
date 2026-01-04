const JoiBase = require("joi");
const { sanitizeString } = require("../utils/auth.js");

const Joi = JoiBase.defaults((schema) =>
  schema.options({ errors: { wrap: { label: false } } })
);

const adoptableSchema = Joi.object({
  name: Joi.string()
    .max(50)
    .required()
    .custom(sanitizeString)
    .label("Pet Name"),
  gender: Joi.string().valid("Male", "Female").required().label("Gender"),
  dob: Joi.date().iso().required().label("Date of Birth"),
  weight_kg: Joi.number()
    .precision(2)
    .min(0)
    .max(999.99)
    .required()
    .label("Weight (kg)"),
  description: Joi.string()
    .allow("", null)
    .custom(sanitizeString)
    .label("Description"),

  // ENUMS from Schema
  sterilized: Joi.string().valid("Yes", "No", "Unknown").default("Unknown"),
  vaccinated: Joi.string()
    .valid("Yes", "No", "Partially", "Unknown")
    .default("Unknown"),
  de_wormed: Joi.string().valid("Yes", "No", "Unknown").default("Unknown"),
  house_trained: Joi.string()
    .valid("Yes", "No", "In-Training")
    .default("In-Training"),
  status: Joi.string()
    .valid("Available", "Adopted", "Hold")
    .default("Available"),

  // Foreign Keys
  breed_id: Joi.number().integer().positive().required(),
  type_id: Joi.number().integer().positive().required(),

  // Address can be sent as an object to be validated by addressSchema
  address: Joi.object(),
});

module.exports = adoptableSchema;
