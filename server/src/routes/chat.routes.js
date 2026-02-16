import { Router } from "express";
import {
  sendMessage,
  getMessages,
  markAsSeen,
  getConversations,
  deleteMessage,
} from "../controllers/chat.controller.js";
import { protect, verifiedOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, verifiedOnly);

// Conversations list
router.get("/conversations", getConversations);

// Messages
router.get("/:matchId/messages", getMessages);
router.post("/:matchId/messages", sendMessage);
router.put("/:matchId/seen", markAsSeen);
router.delete("/:matchId/messages/:messageId", deleteMessage);

export default router;
