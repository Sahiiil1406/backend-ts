import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyEmailVerificationToken } from "../utils/jwt";

export const verifyEmailToken: RequestHandler = (req, _res, next) => {
  const token = Array.isArray(req.query.token)
    ? req.query.token[0]
    : req.query.token;

  if (!token || typeof token !== "string") {
    next(new ApiError(400, "Verification token is required"));
    return;
  }

  try {
    req.verificationPayload = verifyEmailVerificationToken(token);
    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired verification token"));
  }
};
