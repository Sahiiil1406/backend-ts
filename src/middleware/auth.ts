import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthPayload } from "../types/auth";

export const auth: RequestHandler = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies.accessToken ||
      "";
    const secret = env.JWT_SECRET!;
    if (!token) {
      res.status(403).json({
        error: "Please Authenticte.Token Not Found",
        success: false,
      });
      return;
    }
    const decoded = jwt.verify(token, secret) as AuthPayload;
    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.user_id !== "string"
    ) {
      res.status(401).send({ error: "Please authenticate" });
      return;
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: "Please authenticate" });
  }
};
