import { create } from "zustand";
import { matchAPI } from "../api/match.api.js";

export const useMatchStore = create((set, get) => ({
  matches: [],
  isLoading: false,

  fetchMatches: async () => {
    set({ isLoading: true });
    try {
      const res = await matchAPI.getMyMatches();
      set({ matches: res.data.data.matches });
    } catch (err) {
      console.error("Failed to fetch matches:", err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  addMatch: (match) => {
    set((state) => ({
      matches: [match, ...state.matches],
    }));
  },

  removeMatch: (matchId) => {
    set((state) => ({
      matches: state.matches.filter((m) => m.matchId !== matchId),
    }));
  },

  updateLastMessage: (matchId, message) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.matchId === matchId
          ? { ...m, lastMessage: message, lastMessageAt: message.createdAt }
          : m,
      ),
    }));
  },
}));
