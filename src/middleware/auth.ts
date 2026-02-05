import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies.accessToken ||
      "";
    // console.log("Token:", token);
    const secret = process.env.JWT_SECRET!;
    if (!token) {
      return res.status(403).json({
        error: "Please Authenticte.Token Not Found",
        success: false,
      });
    }
    const decoded = jwt.verify(token, secret) as JwtPayload | string;
    req.user = decoded;
    // console.log("Decoded user:", decoded);
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({ error: "Please authenticate" });
  }
};
