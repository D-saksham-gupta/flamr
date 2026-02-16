import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "../api/auth.api.js";
import { connectSocket, disconnectSocket } from "../lib/socket.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      needsOnboarding: false,

      // ── Register ────────────────────────────────────────
      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.register(data);
          return { success: true, data: res.data.data };
        } catch (err) {
          return {
            success: false,
            message: err.response?.data?.message || "Registration failed",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Verify OTP ──────────────────────────────────────
      verifyOTP: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.verifyOTP(data);
          const { token, user, needsOnboarding } = res.data.data;
          localStorage.setItem("token", token);
          connectSocket(token);
          set({ user, token, isAuthenticated: true, needsOnboarding });
          return { success: true, needsOnboarding };
        } catch (err) {
          return {
            success: false,
            message: err.response?.data?.message || "OTP verification failed",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Login ───────────────────────────────────────────
      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.login(data);
          const { token, user, needsOnboarding } = res.data.data;
          localStorage.setItem("token", token);
          connectSocket(token);
          set({ user, token, isAuthenticated: true, needsOnboarding });
          return { success: true, needsOnboarding };
        } catch (err) {
          return {
            success: false,
            message: err.response?.data?.message || "Login failed",
            data: err.response?.data?.data,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Logout ──────────────────────────────────────────
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (_) {}
        localStorage.removeItem("token");
        disconnectSocket();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          needsOnboarding: false,
        });
      },

      // ── Fetch current user ──────────────────────────────
      fetchMe: async () => {
        try {
          const res = await authAPI.getMe();
          const { user, needsOnboarding } = res.data.data;
          set({ user, needsOnboarding, isAuthenticated: true });
          return { success: true };
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem("token");
          return { success: false };
        }
      },

      // ── Update user in store ────────────────────────────
      updateUser: (updatedUser) => {
        set((state) => ({
          user: { ...state.user, ...updatedUser },
          needsOnboarding: !updatedUser.profileComplete,
        }));
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
