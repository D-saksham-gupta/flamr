import { Router } from "express";
import {
  getMyMatches,
  getMatchById,
  unmatch,
  checkMatch,
} from "../controllers/match.controller.js";
import { protect, verifiedOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, verifiedOnly);

router.get("/", getMyMatches);
router.get("/check/:userId", checkMatch);
router.get("/:matchId", getMatchById);
router.delete("/:matchId", unmatch);

export default router;
