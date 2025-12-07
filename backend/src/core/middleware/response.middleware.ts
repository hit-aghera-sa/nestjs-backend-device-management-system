import { Request, Response, NextFunction } from "express";

export function responseFormatter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const oldJson = res.json;

  res.json = function (data: any) {
    const formatted = {
      status: "success",
      path: req.originalUrl,
      data,
    };
    return oldJson.call(this, formatted);
  };

  next();
}

