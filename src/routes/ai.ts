import { Router } from "express";
import { aiControllers } from "../controllers/ai";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validator";
import {
  generateFlashCardSchema,
  generateMindMapSchema,
  generateNotesSchema,
  generateCoursePlanDetailsSchema,
} from "../validators/ai";

const router = Router();

router.use(auth, requireRole("admin", "teacher", "student"));

router.post(
  "/flashcards",
  validate(generateFlashCardSchema),
  aiControllers.generateFlashCardWithAI,
);
router.post(
  "/mindmaps",
  validate(generateMindMapSchema),
  aiControllers.generateMindMapWithAI,
);
router.post(
  "/notes",
  validate(generateNotesSchema),
  aiControllers.generateNotesWithAI,
);
router.post(
  "/course-plan-details",
  validate(generateCoursePlanDetailsSchema),
  aiControllers.generateDetailedFromCoursePlandocs,
);

export default router;
