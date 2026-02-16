import { Router } from "express";
import {
  completeOnboarding,
  uploadPhotos,
  deleteUserPhoto,
  reorderPhotos,
  getMyProfile,
  updateMyProfile,
  updateDiscoverySettings,
  updateLocation,
  getUserProfile,
  getDiscoverFeed,
} from "../controllers/user.controller.js";
import { protect, verifiedOnly } from "../middleware/auth.middleware.js";
import { uploadMultiple } from "../middleware/upload.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Onboarding & profile
router.put("/onboarding", verifiedOnly, completeOnboarding);
router.get("/me", getMyProfile);
router.put("/me", verifiedOnly, updateMyProfile);

// Photos
router.post("/photos", verifiedOnly, uploadMultiple, uploadPhotos);
router.delete("/photos/:publicId", verifiedOnly, deleteUserPhoto);
router.put("/photos/reorder", verifiedOnly, reorderPhotos);

// Settings
router.put("/discovery-settings", verifiedOnly, updateDiscoverySettings);
router.put("/location", verifiedOnly, updateLocation);

// Discovery feed — must be before /:id
router.get("/discover", verifiedOnly, getDiscoverFeed);

// View other profiles
router.get("/:id", verifiedOnly, getUserProfile);

export default router;
