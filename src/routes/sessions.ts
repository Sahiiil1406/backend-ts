import { Router } from "express";
import { sessionsController } from "../controllers/sessions";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validator";
import {
  askAIWithContextSchema,
  getLastSessionSchema,
  listSessionsSchema,
  sessionIdParamSchema,
} from "../validators/sessions";

const router = Router();

router.use(auth, requireRole("admin", "teacher", "student"));

router.post(
  "/ask",
  validate(askAIWithContextSchema),
  sessionsController.askAIWithContext,
);
router.get(
  "/last",
  validate(getLastSessionSchema),
  sessionsController.getLastSession,
);
router.get(
  "/",
  validate(listSessionsSchema),
  sessionsController.getSessionsByUserId,
);
router.get(
  "/:id",
  validate(sessionIdParamSchema),
  sessionsController.getSessionsById,
);

export default router;
