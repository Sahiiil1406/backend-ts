import jwt, { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import { refreshTokens } from "../db/schema/refreshToken";
import { db } from "../db";
import { env } from "../config/env";
import type {
  AuthPayload,
  EmailVerificationPayload,
  RefreshTokenPayload,
} from "../types/auth";

export const generateAccessToken = (user: AuthPayload): string => {
  const payload = {
    user_id: user.user_id,
    role: user.role,
  };

  const secret = env.JWT_SECRET!;
  const options: SignOptions = {
    expiresIn: (env.ACCESS_TOKEN_EXPIRY ?? "1h") as StringValue,
  };

  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = async (
  user: AuthPayload,
): Promise<string> => {
  const token = jwt.sign(
    {
      user_id: user.user_id,
      role: user.role,
    },
    env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" },
  );

  // Save refresh token in DB
  await db.insert(refreshTokens).values({
    user_id: user.user_id,
    token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return token;
};

export const verifyEmailVerificationToken = (
  token: string,
): EmailVerificationPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET!) as jwt.JwtPayload;
  if (
    !decoded ||
    typeof decoded !== "object" ||
    typeof decoded.user_id !== "string" ||
    typeof decoded.email !== "string"
  ) {
    throw new Error("Invalid or expired verification token");
  }

  return { user_id: decoded.user_id, email: decoded.email };
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
  if (
    !decoded ||
    typeof decoded !== "object" ||
    typeof decoded.user_id !== "string"
  ) {
    throw new Error("Invalid refresh token");
  }

  return { user_id: decoded.user_id, role: decoded.role as string | undefined };
};
