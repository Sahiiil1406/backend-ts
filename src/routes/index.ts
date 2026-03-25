import { Router } from "express";
import authRoutes from "./auth";
import collegeRoutes from "./college";
import courseRoutes from "./course";
import flashcardRoutes from "./flashcard";
import mindmapRoutes from "./mindmap";
import noteRoutes from "./note";

const router = Router();

router.use("/auth", authRoutes);
router.use("/colleges", collegeRoutes);
router.use("/courses", courseRoutes);
router.use("/flashcards", flashcardRoutes);
router.use("/mindmaps", mindmapRoutes);
router.use("/notes", noteRoutes);

export default router;
