import api from './api';

export const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      // Backend returns { success: true, data: { totalUsers, lostItems, ... } }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await api.get('/admin/dashboard/activities', {
        params: { limit }
      });
      // Backend returns { success: true, data: { activities: [...], total: N } }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Get quick stats for cards
  getQuickStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/quick-stats');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      throw error;
    }
  }
};