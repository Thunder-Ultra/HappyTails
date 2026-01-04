const JoiBase = require("joi");
const { sanitizeString } = require("../utils/auth.js");

const Joi = JoiBase.defaults((schema) =>
  schema.options({ errors: { wrap: { label: false } } })
);

const userProfileSchema = Joi.object({
  occupation: Joi.string().max(100).custom(sanitizeString).label("Occupation"),
  daily_hours_away: Joi.number().integer().min(0).max(24).label("Hours Away"),
  housing_type: Joi.string()
    .valid("Apartment", "House", "Villa", "Farm")
    .required()
    .label("Housing Type"),
  ownership_status: Joi.string()
    .valid("Owned", "Rented", "Living with Parents")
    .required()
    .label("Ownership Status"),
  has_fenced_yard: Joi.string()
    .valid("Yes", "No")
    .required()
    .label("Fenced Yard"),
  has_kids: Joi.string().valid("Yes", "No").required().label("Has Kids"),
  experience_level: Joi.string()
    .valid("First Time", "Had Pets Before", "Experienced")
    .required()
    .label("Experience Level"),
  other_pet_details: Joi.string()
    .allow("", null)
    .custom(sanitizeString)
    .label("Other Pet Details"),
});

module.exports = userProfileSchema;
