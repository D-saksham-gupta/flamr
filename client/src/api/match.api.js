import api from "../lib/axios.js";

export const matchAPI = {
  getMyMatches: () => api.get("/matches"),
  getMatchById: (matchId) => api.get(`/matches/${matchId}`),
  unmatch: (matchId) => api.delete(`/matches/${matchId}`),
  checkMatch: (userId) => api.get(`/matches/check/${userId}`),
};
