import { Router } from "express";
import authRoutes from "./auth";
import collegeRoutes from "./college";
import courseRoutes from "./course";
import flashcardRoutes from "./flashcard";
import mindmapRoutes from "./mindmap";
import noteRoutes from "./note";
import sessionRoutes from "./sessions";
import aiRoutes from "./ai";

const router = Router();

router.use("/auth", authRoutes);
router.use("/colleges", collegeRoutes);
router.use("/courses", courseRoutes);
router.use("/flashcards", flashcardRoutes);
router.use("/mindmaps", mindmapRoutes);
router.use("/notes", noteRoutes);
router.use("/sessions", sessionRoutes);
router.use("/ai", aiRoutes);

export default router;
