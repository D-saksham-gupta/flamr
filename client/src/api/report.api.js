import api from "../lib/axios.js";

export const reportAPI = {
  reportUser: (data) => api.post("/reports", data),
  blockUser: (userId) => api.post(`/reports/block/${userId}`),
  unblockUser: (userId) => api.delete(`/reports/block/${userId}`),
  getBlockedUsers: () => api.get("/reports/blocked"),
  getMyReports: () => api.get("/reports/my-reports"),
  // Admin
  getAllReports: (params) => api.get("/reports/admin/pending", { params }),
  reviewReport: (reportId, data) => api.put(`/reports/admin/${reportId}`, data),
  banUser: (userId, data) => api.put(`/reports/admin/ban/${userId}`, data),
  unbanUser: (userId) => api.put(`/reports/admin/unban/${userId}`),
  getAllUsers: (params) => api.get("/reports/admin/users", { params }),
};
