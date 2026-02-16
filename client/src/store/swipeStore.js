import { create } from "zustand";
import { userAPI } from "../api/user.api.js";
import { swipeAPI } from "../api/swipe.api.js";

export const useSwipeStore = create((set, get) => ({
  profiles: [],
  currentIndex: 0,
  isLoading: false,
  lastMatch: null,
  filters: {},

  // ── Fetch discovery feed ────────────────────────────────
  fetchProfiles: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const res = await userAPI.getDiscoverFeed(filters);
      set({
        profiles: res.data.data.users,
        currentIndex: 0,
        filters,
      });
    } catch (err) {
      console.error("Failed to fetch profiles:", err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Swipe action ────────────────────────────────────────
  swipe: async (targetUserId, action) => {
    try {
      const res = await swipeAPI.swipe({ targetUserId, action });
      const { matched, match } = res.data.data;

      // Advance to next profile
      set((state) => ({
        currentIndex: state.currentIndex + 1,
        lastMatch: matched ? match : null,
      }));

      return { success: true, matched, match };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Swipe failed",
      };
    }
  },

  // ── Clear last match (after showing modal) ──────────────
  clearLastMatch: () => set({ lastMatch: null }),

  // ── Reset store ─────────────────────────────────────────
  reset: () => set({ profiles: [], currentIndex: 0, lastMatch: null }),
}));
