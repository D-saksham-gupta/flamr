import { useEffect } from "react";
import { useAuthStore } from "../store/authStore.js";
import { connectSocket } from "../lib/socket.js";

export const useAuth = () => {
  const { user, token, isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
    if (token) {
      connectSocket(token);
    }
  }, [token]);

  return { user, token, isAuthenticated };
};
