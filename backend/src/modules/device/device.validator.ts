import Joi from "joi";

export const createDeviceSchema = Joi.object({
  deviceName: Joi.string().min(2).max(100).required(),
  category: Joi.string().min(2).max(100).required(),
  brand: Joi.string().allow(null, ""),
  modelNumber: Joi.string().allow(null, ""),
  serialNumber: Joi.string().required(),
  purchaseDate: Joi.date().allow(null),
  warrantyExpiry: Joi.date().allow(null),
  purchasePrice: Joi.number().min(0).allow(null),
  status: Joi.string()
    .valid("AVAILABLE", "ASSIGNED", "DAMAGED", "MAINTENANCE")
    .default("AVAILABLE"),
  specifications: Joi.string().allow(null, ""),
});

export const updateDeviceSchema = Joi.object({
  deviceName: Joi.string().min(2).max(100),
  category: Joi.string().min(2).max(100),
  brand: Joi.string().allow(null, ""),
  modelNumber: Joi.string().allow(null, ""),
  purchaseDate: Joi.date().allow(null),
  warrantyExpiry: Joi.date().allow(null),
  purchasePrice: Joi.number().min(0).allow(null),
  status: Joi.string().valid("AVAILABLE", "ASSIGNED", "DAMAGED", "MAINTENANCE"),
  specifications: Joi.string().allow(null, ""),
});

