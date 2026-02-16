import type { AuthPayload, EmailVerificationPayload } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      verificationPayload?: EmailVerificationPayload; // Added verification payload
    }
  }
}

export {};
