import Joi from "joi";

export const createEmployeeSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  department: Joi.string().min(2).max(100).required(),
  designation: Joi.string().allow(null, ""),
  contactNumber: Joi.string().pattern(/^[0-9+\-() ]+$/).allow(null, ""),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
});

export const updateEmployeeSchema = Joi.object({
  fullName: Joi.string().min(3).max(100),
  department: Joi.string().min(2).max(100),
  designation: Joi.string().allow(null, ""),
  contactNumber: Joi.string().pattern(/^[0-9+\-() ]+$/).allow(null, ""),
  status: Joi.string().valid("ACTIVE", "INACTIVE"),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

