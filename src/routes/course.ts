import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  listCourses,
  updateCourse,
} from "../controllers/course";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validator";
import {
  courseIdParamSchema,
  createCourseSchema,
  listCoursesSchema,
  updateCourseSchema,
} from "../validators/course";

const router = Router();

router.get(
  "/",
  auth,
  requireRole("admin", "teacher", "student"),
  validate(listCoursesSchema),
  listCourses,
);
router.post(
  "/",
  auth,
  // requireRole("admin"),
  validate(createCourseSchema),
  createCourse,
);
router.get(
  "/:id",
  auth,
  requireRole("admin", "teacher", "student"),
  validate(courseIdParamSchema),
  getCourseById,
);
router.patch(
  "/:id",
  auth,
  requireRole("admin"),
  validate(updateCourseSchema),
  updateCourse,
);
router.delete(
  "/:id",
  auth,
  requireRole("admin"),
  validate(courseIdParamSchema),
  deleteCourse,
);

export default router;
