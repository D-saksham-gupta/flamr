import api from "../lib/axios.js";

export const chatAPI = {
  getConversations: () => api.get("/chat/conversations"),
  getMessages: (matchId, params) =>
    api.get(`/chat/${matchId}/messages`, { params }),
  sendMessage: (matchId, data) => api.post(`/chat/${matchId}/messages`, data),
  markAsSeen: (matchId) => api.put(`/chat/${matchId}/seen`),
  deleteMessage: (matchId, messageId) =>
    api.delete(`/chat/${matchId}/messages/${messageId}`),
};
