import api from "./api";

export const adminService = {
  // Accept optional params (filters, pagination) and return normalized shape
  getAllUsers: async (params = {}) => {
    const res = await api.get("/admin/users", { params });
    // backend returns: { success: true, data: [ ...users ] }
    const data = res.data.data;
    // Normalize to { users, pagination } for frontend expectations
    if (Array.isArray(data)) {
      return { users: data, pagination: null };
    }
    return data;
  },

  // Accept params to request filtered/paginated items
  getAllItems: async (params = {}) => {
    const res = await api.get("/admin/items", { params });
    // backend returns: { success: true, data: { items } }
    const data = res.data.data || {};
    return data;
  },

  // Update item status by sending a consistent payload { status, note }
  updateItemStatus: async (id, status, note = "") => {
    const payload = { status, note };
    const res = await api.put(`/admin/items/${id}/status`, payload);
    return res.data.data;
  }
};
