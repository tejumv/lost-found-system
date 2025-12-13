import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

export const adminAuthService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    if (response.data.success) {
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem(
        "adminData",
        JSON.stringify(response.data.admin)
      );
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  },

  getToken: () => localStorage.getItem("adminToken"),
};
