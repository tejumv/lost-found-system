import api from "./api";

export const dashboardService = {
  getDashboardStats: async () => {
    const res = await api.get("/admin/dashboard/stats");
    return res.data.data;
  },

  getRecentActivities: async (limit = 5) => {
    const res = await api.get("/admin/dashboard/activities", {
      params: { limit }
    });
    return res.data.data;
  }
};
