import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNoteById,
  listNotes,
  updateNote,
} from "../controllers/note";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validator";
import {
  createNoteSchema,
  listNotesSchema,
  noteIdParamSchema,
  updateNoteSchema,
} from "../validators/note";

const router = Router();

router.use(auth, requireRole("admin", "teacher", "student"));

router.get("/", validate(listNotesSchema), listNotes);
router.post("/", validate(createNoteSchema), createNote);
router.get("/:id", validate(noteIdParamSchema), getNoteById);
router.patch("/:id", validate(updateNoteSchema), updateNote);
router.delete("/:id", validate(noteIdParamSchema), deleteNote);

export default router;
