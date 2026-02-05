import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If error is an instance of ApiError, return formatted response
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, false, err.message, err.errors));
  }

  // Handle generic errors
  console.error("Unhandled Error:", err);
  const message = err instanceof Error ? err.message : "Unknown error";
  return res
    .status(500)
    .json(
      new ApiResponse(500, false, "Internal Server Error", { error: message }),
    );
};

export { errorMiddleware };
