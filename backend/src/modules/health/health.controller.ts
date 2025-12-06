import { Request, Response } from "express";
import { successResponse } from "../../core/utils/response.util";

export const getHealth = (_req: Request, res: Response) => {
  return res.json(successResponse({ uptime: process.uptime() }, "OK"));
};

