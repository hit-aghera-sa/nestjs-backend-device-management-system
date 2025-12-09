import Joi from "joi";

export const assignDeviceSchema = Joi.object({
  employeeId: Joi.string().required(),
  deviceId: Joi.string().required(),
  notes: Joi.string().allow(null, ""),
});

export const returnDeviceSchema = Joi.object({
  notes: Joi.string().allow(null, ""),
  deviceStatus: Joi.string().valid("AVAILABLE", "DAMAGED", "MAINTENANCE").required()
});
