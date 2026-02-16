import type { JwtPayload } from "jsonwebtoken";

export type AuthPayload = JwtPayload & {
  user_id: string;
  role?: string;
};

export interface EmailVerificationPayload {
  user_id: string;
  email: string;
}

export interface RefreshTokenPayload {
  user_id: string;
  role?: string;
}
