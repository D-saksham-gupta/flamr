import { Router } from "express";
import {
  swipeUser,
  getSwipeHistory,
  getUsersWhoLikedMe,
} from "../controllers/swipe.controller.js";
import { protect, verifiedOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, verifiedOnly);

router.post("/", swipeUser);
router.get("/history", getSwipeHistory);
router.get("/likes-me", getUsersWhoLikedMe);

export default router;
