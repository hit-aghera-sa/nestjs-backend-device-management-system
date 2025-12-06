import { RequestHandler } from "express";
import Joi from "joi";
import AppError from "../errors/AppError";

/**
 * Validates req.body against a Joi schema. Use like:
 * router.post("/", validate(bodySchema), controller.create)
 */
export const validate = (schema: Joi.ObjectSchema): RequestHandler => {
  return (req, _res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const msg = error.details.map(d => d.message).join(", ");
      return next(new AppError(msg, 400));
    }
    next();
  };
};

