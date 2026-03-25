import { controllerWrapper } from "../utils/controllerWrapper";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { users } from "../db/schema/user";
import { refreshTokens } from "../db/schema/refreshToken";
import { db } from "../db";
import { env } from "../config/env";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyEmailVerificationToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { and, asc, desc, eq, gt, ilike, lt, or } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/nodemailer";
import {
  createCursorResult,
  decodeCursor,
  parseCursorParams,
} from "../utils/cursorPagination";

const SALT_ROUNDS = 10;

const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const verifyPassword = async (password: string, stored: string) => {
  return bcrypt.compare(password, stored);
};

const buildAuthCookies = () => ({
  httpOnly: true,
  sameSite: "strict" as const,
  secure: env.NODE_ENV === "production",
});

export const createAccount = controllerWrapper(async (req, res) => {
  const { name, email, password, role, college_id, year, course } = req.body;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length) {
    throw new ApiError(409, "Account already exists");
  }

  const inserted = await db
    .insert(users)
    .values({
      name,
      email,
      password: password ? await hashPassword(password) : null,
      role: role ?? "student",
      college_id,
      year,
      course,
    })
    .returning({
      user_id: users.user_id,
      email: users.email,
      name: users.name,
    });

  if (!inserted.length) {
    throw new ApiError(500, "Failed to create account");
  }

  if (password) {
    return res.status(201).json(ApiResponse.success(null, "Account created"));
  }

  const user = inserted[0];
  const verificationToken = jwt.sign(
    { user_id: user.user_id, email: user.email },
    env.JWT_SECRET!,
    { expiresIn: "24h" },
  );

  const baseUrl =
    env.BASE_BACKEND_URL ?? `${req.protocol}://${req.get("host")}`;
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${encodeURIComponent(
    verificationToken,
  )}`;

  await sendMail(
    user.email,
    "Verify your LMS account",
    `Your account has been created. Verify your email and set your password: ${verifyUrl}`,
    `<p>Your account has been created.</p><p>Verify your email and set your password:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  );

  return res
    .status(201)
    .json(
      ApiResponse.success(null, "Account created. Verification email sent"),
    );
});

export const completeVerification = controllerWrapper(async (req, res) => {
  const token = Array.isArray(req.query.token)
    ? req.query.token[0]
    : req.query.token;
  const { password } = req.body;

  if (!token || typeof token !== "string") {
    throw new ApiError(400, "Verification token is required");
  }

  let payload: { user_id: string; email: string };
  try {
    payload = verifyEmailVerificationToken(token);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired verification token");
  }

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.user_id, payload.user_id))
    .limit(1);

  if (!userRows.length) {
    throw new ApiError(404, "User not found");
  }

  const user = userRows[0];
  if (user.email !== payload.email) {
    throw new ApiError(401, "Invalid verification token");
  }
  if (user.password) {
    return res
      .status(200)
      .json(ApiResponse.success(null, "Password already set"));
  }

  await db
    .update(users)
    .set({
      password: await hashPassword(password),
      updated_at: new Date(),
    })
    .where(eq(users.user_id, user.user_id));

  return res
    .status(200)
    .json(ApiResponse.success(null, "Password set successfully"));
});
export const login = controllerWrapper(async (req, res) => {
  const { email, password } = req.body;

  const found = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!found.length || !found[0].password) {
    throw new ApiError(401, "Invalid credentials");
  }

  const user = found[0];
  if (!user.is_active) {
    throw new ApiError(403, "Account is inactive");
  }
  const isValid = await verifyPassword(password, user.password!);
  if (!isValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  await db.delete(refreshTokens).where(eq(refreshTokens.user_id, user.user_id));

  const accessToken = generateAccessToken({
    user_id: user.user_id,
    role: user.role,
  });
  const refreshToken = await generateRefreshToken({
    user_id: user.user_id,
    role: user.role,
  });

  await db
    .update(users)
    .set({ last_login_at: new Date(), updated_at: new Date() })
    .where(eq(users.user_id, user.user_id));

  res.cookie("accessToken", accessToken, buildAuthCookies());
  res.cookie("refreshToken", refreshToken, buildAuthCookies());

  return res.status(200).json(
    ApiResponse.success(
      {
        accessToken,
        refreshToken,
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          college_id: user.college_id,
          year: user.year,
          course: user.course,
        },
      },
      "Login successful",
    ),
  );
});

export const refresh = controllerWrapper(async (req, res) => {
  const refreshToken = req.body?.refreshToken || req.cookies.refreshToken || "";

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token required");
  }

  let payload: { user_id: string; role?: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const tokenRows = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.user_id, payload.user_id),
        eq(refreshTokens.token, refreshToken),
      ),
    )
    .limit(1);

  if (!tokenRows.length) {
    throw new ApiError(401, "Refresh token not recognized");
  }

  if (tokenRows[0].expires_at < new Date()) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    throw new ApiError(401, "Refresh token expired");
  }

  await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.user_id, payload.user_id))
    .limit(1);

  if (!userRows.length) {
    throw new ApiError(404, "User not found");
  }

  const user = userRows[0];
  const newAccessToken = generateAccessToken({
    user_id: user.user_id,
    role: user.role,
  });
  const newRefreshToken = await generateRefreshToken({
    user_id: user.user_id,
    role: user.role,
  });

  res.cookie("accessToken", newAccessToken, buildAuthCookies());
  res.cookie("refreshToken", newRefreshToken, buildAuthCookies());

  return res
    .status(200)
    .json(
      ApiResponse.success(
        { accessToken: newAccessToken, refreshToken: newRefreshToken },
        "Token refreshed",
      ),
    );
});

export const logout = controllerWrapper(async (req, res) => {
  const refreshToken = req.body?.refreshToken || req.cookies.refreshToken || "";

  if (refreshToken) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json(ApiResponse.success(null, "Logged out"));
});

export const updateUserDetail = controllerWrapper(async (req, res) => {
  const targetId = req.params.id;

  const updateData: Record<string, unknown> = { ...req.body };

  updateData.updated_at = new Date();

  if (typeof updateData.password === "string") {
    updateData.password = await hashPassword(updateData.password);
  }

  await db.update(users).set(updateData).where(eq(users.user_id, targetId));

  return res.status(200).json(ApiResponse.success(null, "User updated"));
});

export const deleteAccount = controllerWrapper(async (req, res) => {
  const targetId = req.params.id;

  await db.delete(refreshTokens).where(eq(refreshTokens.user_id, targetId));
  await db.delete(users).where(eq(users.user_id, targetId));

  return res.status(200).json(ApiResponse.success(null, "Account deleted"));
});

export const listUsers = controllerWrapper(async (req, res) => {
  const { limit, cursor } = parseCursorParams(req.query);
  const {
    role,
    college_id,
    search,
    sort = "created_at",
    order = "desc",
  } = req.query;

  const whereClauses = [] as any[];
  if (role) {
    whereClauses.push(eq(users.role, role as string));
  }
  if (college_id) {
    whereClauses.push(eq(users.college_id, college_id as string));
  }
  if (search) {
    whereClauses.push(
      or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`)),
    );
  }

  const cursorValue = cursor ? decodeCursor(cursor as string) : null;
  if (cursorValue) {
    const cursorDate = new Date(cursorValue);
    if (order === "desc") {
      whereClauses.push(lt(users.created_at, cursorDate));
    } else {
      whereClauses.push(gt(users.created_at, cursorDate));
    }
  }

  const orderBy =
    order === "asc"
      ? asc(
          sort === "name"
            ? users.name
            : sort === "email"
              ? users.email
              : sort === "year"
                ? users.year
                : users.created_at,
        )
      : desc(
          sort === "name"
            ? users.name
            : sort === "email"
              ? users.email
              : sort === "year"
                ? users.year
                : users.created_at,
        );

  const data = await db
    .select({
      id: users.user_id,
      name: users.name,
      email: users.email,
      role: users.role,
      college_id: users.college_id,
      year: users.year,
      course: users.course,
      created_at: users.created_at,
      is_active: users.is_active,
    })
    .from(users)
    .where(whereClauses.length ? and(...whereClauses) : undefined)
    .orderBy(orderBy)
    .limit(limit + 1);

  const result = createCursorResult(data, limit, "created_at");

  return res.status(200).json(ApiResponse.success(result, "Users list"));
});

export const createAdmin = controllerWrapper(async (req, res) => {
  const { name, email, password, college_id, year, course } = req.body;
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length) {
    throw new ApiError(409, "Account already exists");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      college_id,
      year,
      course,
    })
    .returning();

  return res.status(201).json(ApiResponse.success(newUser[0], "Admin created"));
});

export const forgotPassword = controllerWrapper(async (req, res) => {
  const { email } = req.body;

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always return success for security (don't reveal if email exists)
  if (!userRows.length) {
    return res
      .status(200)
      .json(
        ApiResponse.success(
          null,
          "If this email exists, a reset link has been sent",
        ),
      );
  }

  const user = userRows[0];
  const resetToken = jwt.sign(
    { user_id: user.user_id, email: user.email },
    env.JWT_SECRET!,
    { expiresIn: "1h" },
  );

  const baseUrl =
    env.BASE_BACKEND_URL ?? `${req.protocol}://${req.get("host")}`;
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(
    resetToken,
  )}`;

  await sendMail(
    user.email,
    "Reset Your Password",
    `Click the link below to reset your password. This link expires in 1 hour: ${resetUrl}`,
    `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
  );

  return res
    .status(200)
    .json(
      ApiResponse.success(
        null,
        "If this email exists, a reset link has been sent",
      ),
    );
});

export const resetPassword = controllerWrapper(async (req, res) => {
  const token = Array.isArray(req.query.token)
    ? req.query.token[0]
    : req.query.token;
  const { password } = req.body;

  if (!token || typeof token !== "string") {
    throw new ApiError(400, "Reset token is required");
  }

  let payload: { user_id: string; email: string };
  try {
    payload = verifyEmailVerificationToken(token);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired reset token");
  }

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.user_id, payload.user_id))
    .limit(1);

  if (!userRows.length) {
    throw new ApiError(404, "User not found");
  }

  const user = userRows[0];
  if (user.email !== payload.email) {
    throw new ApiError(401, "Invalid reset token");
  }

  await db
    .update(users)
    .set({
      password: await hashPassword(password),
      updated_at: new Date(),
    })
    .where(eq(users.user_id, user.user_id));

  return res
    .status(200)
    .json(ApiResponse.success(null, "Password reset successfully"));
});
