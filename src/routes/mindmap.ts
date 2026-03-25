import { Router } from "express";
import {
  createMindmap,
  deleteMindmap,
  getMindmapById,
  listMindmaps,
  updateMindmap,
} from "../controllers/mindmap";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validator";
import {
  createMindmapSchema,
  listMindmapsSchema,
  mindmapIdParamSchema,
  updateMindmapSchema,
} from "../validators/mindmap";

const router = Router();

router.use(auth, requireRole("admin", "teacher", "student"));

router.get("/", validate(listMindmapsSchema), listMindmaps);
router.post("/", validate(createMindmapSchema), createMindmap);
router.get("/:id", validate(mindmapIdParamSchema), getMindmapById);
router.patch("/:id", validate(updateMindmapSchema), updateMindmap);
router.delete("/:id", validate(mindmapIdParamSchema), deleteMindmap);

export default router;
