const Notification = require("../models/Notification");

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(50);

        // Count unread
        const unreadCount = await Notification.countDocuments({
            userId: req.userId,
            read: false
        });

        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Mark as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;

        await Notification.findByIdAndUpdate(notificationId, {
            read: true
        });

        const unreadCount = await Notification.countDocuments({
            userId: req.userId,
            read: false
        });

        res.json({
            success: true,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.userId, read: false },
            { read: true }
        );

        res.json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        await Notification.findByIdAndDelete(notificationId);

        res.json({
            success: true,
            message: "Notification deleted"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};