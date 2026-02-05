import jwt, { SignOptions } from "jsonwebtoken";
import { refreshTokens } from "../db/schema/refreshToken";
import { db } from "../db";

export interface AuthUser {
  user_id: number;
  subscriptionExpiry?: string | Date | null;
}

export const generateAccessToken = (user: AuthUser): string => {
  const payload = {
    user_id: user.user_id,
    subscriptionExpiry: user.subscriptionExpiry ?? null,
  };

  const secret = process.env.JWT_SECRET!;
  const options: SignOptions = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY ?? "1h",
  };

  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = async (user: AuthUser): Promise<string> => {
  const token = jwt.sign(
    {
      user_id: user.user_id,
      subscriptionExpiry: user.subscriptionExpiry ?? null,
    },
    process.env.JWT_REFRESH_SECRET as string,
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
