import api from "../lib/axios.js";

export const swipeAPI = {
  swipe: (data) => api.post("/swipes", data),
  getHistory: (params) => api.get("/swipes/history", { params }),
  getLikesMe: () => api.get("/swipes/likes-me"),
};
