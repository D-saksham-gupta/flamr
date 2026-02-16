import api from "../lib/axios.js";

export const userAPI = {
  completeOnboarding: (data) => api.put("/users/onboarding", data),
  getMyProfile: () => api.get("/users/me"),
  updateProfile: (data) => api.put("/users/me", data),
  uploadPhotos: (formData) =>
    api.post("/users/photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePhoto: (publicId) =>
    api.delete(`/users/photos/${encodeURIComponent(publicId)}`),
  reorderPhotos: (data) => api.put("/users/photos/reorder", data),
  updateLocation: (data) => api.put("/users/location", data),
  updateDiscoverySettings: (data) => api.put("/users/discovery-settings", data),
  getDiscoverFeed: (params) => api.get("/users/discover", { params }),
  getUserProfile: (id) => api.get(`/users/${id}`),
};
