const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/admin');

// Public routes
router.post('/login', adminController.loginAdmin);

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/activities', adminController.getRecentActivities);

// User management
router.get('/users', adminController.getAllUsers);

// Item management
router.get('/items', adminController.getAllItems);
router.put('/items/:id/status', adminController.updateItemStatus);

module.exports = router;