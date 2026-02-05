import { ZodError, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        accessToken:
          req.headers.authorization?.split(" ")[1] ||
          req.cookies.accessToken ||
          "", // if needed
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          message: "Invalid request",
          errors: err,
        });
        return;
      }
      next(err);
    }
  };
