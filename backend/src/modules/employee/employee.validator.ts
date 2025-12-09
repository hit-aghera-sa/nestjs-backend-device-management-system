import Joi from "joi";

export const createEmployeeSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  department: Joi.string().min(2).max(100).required(),
  designation: Joi.string().allow(null, ""),
    contactNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Contact number is required",
      "any.required": "Contact number is required",
      "string.pattern.base": "Contact number must be exactly 10 digits",
    }),

  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
});

export const updateEmployeeSchema = Joi.object({
  fullName: Joi.string().min(3).max(100),
  department: Joi.string().min(2).max(100),
  designation: Joi.string().allow(null, ""),
    contactNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.empty": "Contact number is required",
      "any.required": "Contact number is required",
      "string.pattern.base": "Contact number must be exactly 10 digits",
    }),

  status: Joi.string().valid("ACTIVE", "INACTIVE"),
}).min(1);

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

