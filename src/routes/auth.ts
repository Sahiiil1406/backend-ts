import { Router } from "express";
import {
  completeVerification,
  createAccount,
  createAdmin,
  deleteAccount,
  listUsers,
  login,
  logout,
  refresh,
  updateUserDetail,
} from "../controllers/auth";
import { validate } from "../middleware/validator";
import {
  completeVerificationSchema,
  createAccountSchema,
  createAdminSchema,
  deleteUserSchema,
  listUsersSchema,
  loginSchema,
  refreshSchema,
  updateUserSchema,
} from "../validators/auth";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();

router.post(
  "/register",
  auth,
  requireRole("admin"),
  validate(createAccountSchema),
  createAccount,
);
router.post(
  "/verify",
  validate(completeVerificationSchema),
  completeVerification,
);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", auth, logout);

router.get(
  "/users",
  auth,
  requireRole("admin"),
  validate(listUsersSchema),
  listUsers,
);
router.patch(
  "/users/:id?",
  auth,
  validate(updateUserSchema),
  requireRole("admin"),
  updateUserDetail,
);
router.delete(
  "/users/:id?",
  auth,
  validate(deleteUserSchema),
  requireRole("admin"),
  deleteAccount,
);

router.post(
  "/admin",
  auth,
  requireRole("admin"),
  validate(createAdminSchema),
  createAdmin,
);

export default router;
