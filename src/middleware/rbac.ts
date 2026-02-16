import { RequestHandler } from "express";

export const requireRole = (...allowedRoles: string[]) => {
  const handler: RequestHandler = (req, res, next) => {
    const user = req.user as { role?: string } | undefined;
    if (!user?.role || !allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied",
      });
      return;
    }
    next();
  };

  return handler;
};
