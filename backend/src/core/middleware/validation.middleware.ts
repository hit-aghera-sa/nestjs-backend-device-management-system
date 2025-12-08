import { RequestHandler } from "express";
import Joi = require("joi");
import AppError from "../errors/AppError";

export const validate = (schema: any): RequestHandler => {
  return (req, _res, next) => {
    const body = req.body ?? {};   // ⭐ This fixes empty-body 500 errors

    const { error } = schema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const msg = error.details
        .map((d: any) => d.message)
        .join(", ");
      return next(new AppError(msg, 400)); // always a 400, never 500
    }

    next();
  };
};
