import { Router } from "express";
import {
  reportUser,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getMyReports,
  getAllReports,
  reviewReport,
  banUser,
  unbanUser,
  getAllUsers,
} from "../controllers/report.controller.js";
import {
  protect,
  verifiedOnly,
  adminOnly,
} from "../middleware/auth.middleware.js";

const router = Router();

// ── User routes ───────────────────────────────────────────
router.use(protect, verifiedOnly);

router.post("/", reportUser);
router.get("/my-reports", getMyReports);
router.get("/blocked", getBlockedUsers);
router.post("/block/:userId", blockUser);
router.delete("/block/:userId", unblockUser);

// ── Admin routes ──────────────────────────────────────────
router.use(adminOnly);

router.get("/admin/users", getAllUsers);
router.get("/admin/pending", getAllReports);
router.put("/admin/:reportId", reviewReport);
router.put("/admin/ban/:userId", banUser);
router.put("/admin/unban/:userId", unbanUser);

export default router;
