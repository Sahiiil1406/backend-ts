import { Router } from "express";
import {
  createCollege,
  deleteCollege,
  getCollegeById,
  listColleges,
  updateCollege,
} from "../controllers/college";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validator";
import {
  collegeIdParamSchema,
  createCollegeSchema,
  listCollegesSchema,
  updateCollegeSchema,
} from "../validators/college";

const router = Router();

router.get(
  "/",
  auth,
  requireRole("admin", "teacher", "student"),
  validate(listCollegesSchema),
  listColleges,
);
router.post(
  "/",
  // auth,
  // requireRole("admin"),
  validate(createCollegeSchema),
  createCollege,
);
router.get(
  "/:id",
  auth,
  requireRole("admin", "teacher", "student"),
  validate(collegeIdParamSchema),
  getCollegeById,
);
router.patch(
  "/:id",
  auth,
  // requireRole("admin"),
  validate(updateCollegeSchema),
  updateCollege,
);
router.delete(
  "/:id",
  auth,
  // requireRole("admin"),
  validate(collegeIdParamSchema),
  deleteCollege,
);

export default router;
