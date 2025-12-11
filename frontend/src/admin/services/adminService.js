import api from './api';

export const adminService = {
  // User Management
  getAllUsers: async (params) => {
    try {
      const response = await api.get('/admin/users', { params });
      // Backend returns { success: true, data: { users: [...], pagination: {...} } }
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Item Management
  getAllItems: async (params) => {
    try {
      const response = await api.get('/admin/items', { params });
      // Backend returns { success: true, data: { items: [...], pagination: {...} } }
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  updateItemStatus: async (id, status, adminNotes) => {
    try {
      const response = await api.put(`/admin/items/${id}/status`, { status, adminNotes });
      // Backend returns { success: true, data: item }
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Settings (Placeholder for now)
  updateSettings: async (settings) => {
    // Implement when backend supports it
    return { success: true };
  }
};
