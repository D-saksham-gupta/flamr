import { create } from "zustand";
import { chatAPI } from "../api/chat.api.js";

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeMatchId: null,
  messages: {}, // { matchId: [messages] }
  typingUsers: {}, // { matchId: userId }
  onlineUsers: new Set(),
  isLoading: false,

  // ── Conversations ───────────────────────────────────────
  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await chatAPI.getConversations();
      set({ conversations: res.data.data.conversations });
    } catch (err) {
      console.error("Failed to fetch conversations:", err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Messages ────────────────────────────────────────────
  fetchMessages: async (matchId, page = 1) => {
    set({ isLoading: true });
    try {
      const res = await chatAPI.getMessages(matchId, { page });
      const fetched = res.data.data.messages;
      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]:
            page === 1
              ? fetched
              : [...fetched, ...(state.messages[matchId] || [])],
        },
        activeMatchId: matchId,
      }));
    } catch (err) {
      console.error("Failed to fetch messages:", err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Add incoming message ────────────────────────────────
  addMessage: (matchId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), message],
      },
      conversations: state.conversations.map((c) =>
        c.matchId === matchId
          ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
          : c,
      ),
    }));
  },

  // ── Update message status ───────────────────────────────
  updateMessageStatus: (matchId, messageId, status) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: (state.messages[matchId] || []).map((m) =>
          m._id === messageId ? { ...m, status } : m,
        ),
      },
    }));
  },

  // ── Mark all as seen ────────────────────────────────────
  markAllSeen: (matchId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: (state.messages[matchId] || []).map((m) =>
          m.status !== "seen" ? { ...m, status: "seen" } : m,
        ),
      },
      conversations: state.conversations.map((c) =>
        c.matchId === matchId ? { ...c, unreadCount: 0 } : c,
      ),
    }));
  },

  // ── Delete message ──────────────────────────────────────
  removeMessage: (matchId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: (state.messages[matchId] || []).filter(
          (m) => m._id !== messageId,
        ),
      },
    }));
  },

  // ── Typing ──────────────────────────────────────────────
  setTyping: (matchId, userId) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [matchId]: userId },
    }));
  },

  clearTyping: (matchId) => {
    set((state) => {
      const updated = { ...state.typingUsers };
      delete updated[matchId];
      return { typingUsers: updated };
    });
  },

  // ── Online presence ─────────────────────────────────────
  setUserOnline: (userId) => {
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    }));
  },

  setUserOffline: (userId) => {
    set((state) => {
      const updated = new Set(state.onlineUsers);
      updated.delete(userId);
      return { onlineUsers: updated };
    });
  },

  // ── Helpers ─────────────────────────────────────────────
  setActiveMatch: (matchId) => set({ activeMatchId: matchId }),
  clearActiveMatch: () => set({ activeMatchId: null }),
}));
