import Message from "../models/Message.model.js";
import Match from "../models/Match.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";

// ── Helper: verify user is part of match ─────────────────
const verifyMatchMember = async (matchId, userId) => {
  const match = await Match.findById(matchId);
  if (!match) return { error: "Match not found", status: 404 };
  if (!match.isActive)
    return { error: "This match is no longer active", status: 403 };
  const isMember = match.users.some((u) => u.toString() === userId.toString());
  if (!isMember) return { error: "Access denied", status: 403 };
  return { match };
};

// ─────────────────────────────────────────────────────────
// @desc    Send a message
// @route   POST /api/chat/:matchId/messages
// @access  Private
// ─────────────────────────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return sendError(res, 400, "Message content is required");
    }
    if (content.length > 1000) {
      return sendError(res, 400, "Message cannot exceed 1000 characters");
    }

    const { match, error, status } = await verifyMatchMember(
      matchId,
      req.user._id,
    );
    if (error) return sendError(res, status, error);

    const message = await Message.create({
      matchId,
      sender: req.user._id,
      content: content.trim(),
      status: "sent",
    });

    // Update match's last message
    match.lastMessage = message._id;
    match.lastMessageAt = message.createdAt;
    await match.save();

    const populated = await Message.findById(message._id).populate(
      "sender",
      "name photos",
    );

    // Emit via socket (imported from server.js)
    const { io } = await import("../server.js");
    io.to(`match_${matchId}`).emit("new_message", populated);

    return sendSuccess(res, 201, "Message sent", { message: populated });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get messages for a match (paginated)
// @route   GET /api/chat/:matchId/messages
// @access  Private
// ─────────────────────────────────────────────────────────
export const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const { error, status } = await verifyMatchMember(matchId, req.user._id);
    if (error) return sendError(res, status, error);

    const [messages, total] = await Promise.all([
      Message.find({ matchId })
        .populate("sender", "name photos")
        .sort({ createdAt: -1 }) // newest first
        .skip(skip)
        .limit(parseInt(limit)),
      Message.countDocuments({ matchId }),
    ]);

    // Mark unread messages as delivered
    await Message.updateMany(
      {
        matchId,
        sender: { $ne: req.user._id },
        status: "sent",
      },
      { $set: { status: "delivered" } },
    );

    return sendSuccess(res, 200, "Messages fetched", {
      messages: messages.reverse(), // return oldest first
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Mark all messages in match as seen
// @route   PUT /api/chat/:matchId/seen
// @access  Private
// ─────────────────────────────────────────────────────────
export const markAsSeen = async (req, res) => {
  try {
    const { matchId } = req.params;

    const { error, status } = await verifyMatchMember(matchId, req.user._id);
    if (error) return sendError(res, status, error);

    await Message.updateMany(
      {
        matchId,
        sender: { $ne: req.user._id },
        status: { $in: ["sent", "delivered"] },
      },
      {
        $set: {
          status: "seen",
          seenAt: new Date(),
        },
      },
    );

    // Notify the other user via socket
    const { io } = await import("../server.js");
    io.to(`match_${matchId}`).emit("messages_seen", {
      matchId,
      seenBy: req.user._id,
      seenAt: new Date(),
    });

    return sendSuccess(res, 200, "Messages marked as seen");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get all conversations (matches with last message)
// @route   GET /api/chat/conversations
// @access  Private
// ─────────────────────────────────────────────────────────
export const getConversations = async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user._id,
      isActive: true,
    })
      .populate("users", "name photos lastActive")
      .populate("lastMessage", "content createdAt sender status")
      .sort({ lastMessageAt: -1, createdAt: -1 });

    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUser = match.users.find(
          (u) => u._id.toString() !== req.user._id.toString(),
        );

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          matchId: match._id,
          sender: { $ne: req.user._id },
          status: { $in: ["sent", "delivered"] },
        });

        return {
          matchId: match._id,
          user: otherUser,
          lastMessage: match.lastMessage,
          lastMessageAt: match.lastMessageAt,
          unreadCount,
          matchedAt: match.createdAt,
        };
      }),
    );

    return sendSuccess(res, 200, "Conversations fetched", {
      conversations,
      count: conversations.length,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Delete a message (only sender can delete)
// @route   DELETE /api/chat/:matchId/messages/:messageId
// @access  Private
// ─────────────────────────────────────────────────────────
export const deleteMessage = async (req, res) => {
  try {
    const { matchId, messageId } = req.params;

    const { error, status } = await verifyMatchMember(matchId, req.user._id);
    if (error) return sendError(res, status, error);

    const message = await Message.findById(messageId);
    if (!message) return sendError(res, 404, "Message not found");
    if (message.sender.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "You can only delete your own messages");
    }

    await message.deleteOne();

    // Update match lastMessage if this was it
    const match = await Match.findById(matchId);
    if (match.lastMessage?.toString() === messageId) {
      const prevMessage = await Message.findOne({ matchId }).sort({
        createdAt: -1,
      });
      match.lastMessage = prevMessage?._id || null;
      match.lastMessageAt = prevMessage?.createdAt || null;
      await match.save();
    }

    // Notify via socket
    const { io } = await import("../server.js");
    io.to(`match_${matchId}`).emit("message_deleted", {
      matchId,
      messageId,
    });

    return sendSuccess(res, 200, "Message deleted");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};
