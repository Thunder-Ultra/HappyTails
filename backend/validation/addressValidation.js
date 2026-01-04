const JoiBase = require("joi");
const { sanitizeString } = require("../utils/auth.js");

const Joi = JoiBase.defaults((schema) =>
  schema.options({ errors: { wrap: { label: false } } })
);

const addressSchema = Joi.object({
  house_no: Joi.string().max(50).custom(sanitizeString).label("House No"),
  street: Joi.string()
    .max(100)
    .required()
    .custom(sanitizeString)
    .label("Street"),
  landmark: Joi.string()
    .max(100)
    .allow("", null)
    .custom(sanitizeString)
    .label("Landmark"),
  pincode: Joi.string()
    .max(20)
    .required()
    .custom(sanitizeString)
    .label("Pincode"),
  town_city: Joi.string()
    .max(100)
    .required()
    .custom(sanitizeString)
    .label("City"),
  state: Joi.string().max(100).required().custom(sanitizeString).label("State"),
});

module.exports = addressSchema;
