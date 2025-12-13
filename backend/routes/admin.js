const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/admin");

const {
  loginAdmin,
  getDashboardStats,
  getRecentActivities,
  getAllUsers,
  getAllItems,
  updateItemStatus
} = require("../controllers/adminController");

router.post("/login", loginAdmin);

router.get("/dashboard/stats", adminMiddleware, getDashboardStats);
router.get("/dashboard/activities", adminMiddleware, getRecentActivities);

router.get("/users", adminMiddleware, getAllUsers);

router.get("/items", adminMiddleware, getAllItems);
router.put("/items/:id/status", adminMiddleware, updateItemStatus);

module.exports = router;
