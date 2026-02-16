import { useEffect } from "react";
import { getSocket } from "../lib/socket.js";
import { useChatStore } from "../store/chatStore.js";
import { useMatchStore } from "../store/matchStore.js";

export const useSocket = () => {
  const {
    addMessage,
    updateMessageStatus,
    markAllSeen,
    removeMessage,
    setTyping,
    clearTyping,
    setUserOnline,
    setUserOffline,
  } = useChatStore();

  const { addMatch } = useMatchStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // ── Incoming message ──────────────────────────────────
    socket.on("new_message", (message) => {
      addMessage(message.matchId, message);
    });

    // ── Delivery status ───────────────────────────────────
    socket.on("message_delivered", ({ messageId, matchId }) => {
      updateMessageStatus(matchId, messageId, "delivered");
    });

    // ── Seen status ───────────────────────────────────────
    socket.on("messages_seen", ({ matchId }) => {
      markAllSeen(matchId);
    });

    // ── Message deleted ───────────────────────────────────
    socket.on("message_deleted", ({ matchId, messageId }) => {
      removeMessage(matchId, messageId);
    });

    // ── Typing ────────────────────────────────────────────
    socket.on("user_typing", ({ userId, matchId }) => {
      setTyping(matchId, userId);
    });
    socket.on("user_stopped_typing", ({ matchId }) => {
      clearTyping(matchId);
    });

    // ── Online presence ───────────────────────────────────
    socket.on("user_online", ({ userId }) => setUserOnline(userId));
    socket.on("user_offline", ({ userId }) => setUserOffline(userId));

    return () => {
      socket.off("new_message");
      socket.off("message_delivered");
      socket.off("messages_seen");
      socket.off("message_deleted");
      socket.off("user_typing");
      socket.off("user_stopped_typing");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, []);
};
