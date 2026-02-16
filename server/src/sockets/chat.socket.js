import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Match from "../models/Match.model.js";
import Message from "../models/Message.model.js";

// Map of userId -> socketId for online presence
export const onlineUsers = new Map();

export const initializeSockets = (io) => {
  // ── Auth middleware for sockets ───────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name photos");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 Connected: ${socket.user.name} (${socket.id})`);

    // ── Track online status ───────────────────────────────
    onlineUsers.set(userId, socket.id);
    io.emit("user_online", { userId });

    // Update lastActive in DB
    User.findByIdAndUpdate(userId, { lastActive: new Date() }).exec();

    // ── Join personal room ────────────────────────────────
    socket.join(`user_${userId}`);

    // ── Join a match/chat room ────────────────────────────
    socket.on("join_match", async ({ matchId }) => {
      try {
        const match = await Match.findOne({
          _id: matchId,
          users: userId,
          isActive: true,
        });
        if (!match) {
          socket.emit("error", { message: "Match not found or access denied" });
          return;
        }
        socket.join(`match_${matchId}`);
        socket.emit("joined_match", { matchId });
        console.log(`💬 ${socket.user.name} joined match_${matchId}`);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── Leave a match room ────────────────────────────────
    socket.on("leave_match", ({ matchId }) => {
      socket.leave(`match_${matchId}`);
      console.log(`🚪 ${socket.user.name} left match_${matchId}`);
    });

    // ── Real-time message sending via socket ──────────────
    socket.on("send_message", async ({ matchId, content }) => {
      try {
        if (!content?.trim()) return;
        if (content.length > 1000) {
          socket.emit("error", { message: "Message too long" });
          return;
        }

        const match = await Match.findOne({
          _id: matchId,
          users: userId,
          isActive: true,
        });
        if (!match) {
          socket.emit("error", { message: "Match not found" });
          return;
        }

        const message = await Message.create({
          matchId,
          sender: userId,
          content: content.trim(),
          status: "sent",
        });

        // Update match last message
        match.lastMessage = message._id;
        match.lastMessageAt = message.createdAt;
        await match.save();

        const populated = await Message.findById(message._id).populate(
          "sender",
          "name photos",
        );

        // Emit to everyone in the match room
        io.to(`match_${matchId}`).emit("new_message", populated);

        // If other user is online but not in room, send notification
        const otherUserId = match.users
          .find((u) => u.toString() !== userId)
          ?.toString();

        if (otherUserId && onlineUsers.has(otherUserId)) {
          const otherSocketId = onlineUsers.get(otherUserId);
          const otherSocket = io.sockets.sockets.get(otherSocketId);
          const rooms = otherSocket?.rooms || new Set();

          if (!rooms.has(`match_${matchId}`)) {
            // They're online but not in this chat — send a push notification event
            io.to(`user_${otherUserId}`).emit("new_message_notification", {
              matchId,
              sender: {
                id: userId,
                name: socket.user.name,
                photo: socket.user.photos?.[0]?.url || null,
              },
              preview: content.trim().substring(0, 50),
            });
          }
        }

        // Auto mark as delivered if other user is in the room
        const room = io.sockets.adapter.rooms.get(`match_${matchId}`);
        if (room && room.size > 1) {
          await Message.findByIdAndUpdate(message._id, { status: "delivered" });
          io.to(`match_${matchId}`).emit("message_delivered", {
            messageId: message._id,
            matchId,
          });
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── Typing indicators ─────────────────────────────────
    socket.on("typing_start", ({ matchId }) => {
      socket.to(`match_${matchId}`).emit("user_typing", {
        userId,
        matchId,
        name: socket.user.name,
      });
    });

    socket.on("typing_stop", ({ matchId }) => {
      socket.to(`match_${matchId}`).emit("user_stopped_typing", {
        userId,
        matchId,
      });
    });

    // ── Mark messages seen via socket ─────────────────────
    socket.on("mark_seen", async ({ matchId }) => {
      try {
        await Message.updateMany(
          {
            matchId,
            sender: { $ne: userId },
            status: { $in: ["sent", "delivered"] },
          },
          { $set: { status: "seen", seenAt: new Date() } },
        );

        io.to(`match_${matchId}`).emit("messages_seen", {
          matchId,
          seenBy: userId,
          seenAt: new Date(),
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── Disconnect ────────────────────────────────────────
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("user_offline", { userId });
      User.findByIdAndUpdate(userId, { lastActive: new Date() }).exec();
      console.log(`❌ Disconnected: ${socket.user.name}`);
    });
  });
};
