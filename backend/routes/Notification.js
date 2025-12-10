const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

// Get notifications
router.get("/", auth, notificationController.getNotifications);

// Mark as read
router.post("/read", auth, notificationController.markAsRead);

// Mark all as read
router.post("/read-all", auth, notificationController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", auth, notificationController.deleteNotification);

module.exports = router;