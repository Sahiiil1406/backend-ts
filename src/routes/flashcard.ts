import { Router } from "express";
import {
  createFlashcard,
  deleteFlashcard,
  getFlashcardById,
  listFlashcards,
  updateFlashcard,
} from "../controllers/flashcard";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validator";
import {
  createFlashcardSchema,
  flashcardIdParamSchema,
  listFlashcardsSchema,
  updateFlashcardSchema,
} from "../validators/flashcard";

const router = Router();

router.use(auth, requireRole("admin", "teacher", "student"));

router.get("/", validate(listFlashcardsSchema), listFlashcards);
router.post("/", validate(createFlashcardSchema), createFlashcard);
router.get("/:id", validate(flashcardIdParamSchema), getFlashcardById);
router.patch("/:id", validate(updateFlashcardSchema), updateFlashcard);
router.delete("/:id", validate(flashcardIdParamSchema), deleteFlashcard);

export default router;
