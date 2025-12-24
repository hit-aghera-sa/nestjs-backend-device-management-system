import * as Joi from "joi";

export const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
}).min(1);

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
});

export const updateAdminSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid("MASTER", "ADMIN").optional(),
  isActive: Joi.boolean().optional(),
}).min(1);
