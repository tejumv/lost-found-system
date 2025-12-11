const Admin = require('../models/Admin');
const User = require('../models/User');
const Item = require('../models/Item');
const Activity = require('../models/Activity');

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!admin.isActive) {
            return res.status(401).json({ success: false, message: 'Account is deactivated' });
        }

        const token = admin.getSignedJwtToken();
        admin.lastLogin = Date.now();
        await admin.save();

        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // Get counts in parallel for better performance
        const [
            totalUsers,
            lostItems,
            foundItems,
            resolvedCases,
            allItems
        ] = await Promise.all([
            User.countDocuments(),
            Item.countDocuments({ category: 'lost' }),
            Item.countDocuments({ category: 'found' }),
            Item.countDocuments({ status: 'returned' }),
            Item.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                lostItems,
                foundItems,
                resolvedCases,
                pendingApproval: allItems
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get recent activities
// @route   GET /api/admin/dashboard/activities
// @access  Private/Admin
exports.getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const activities = await Activity.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'name email')
            .populate('adminId', 'name email')
            .lean();

        // Format activities for frontend
        const formattedActivities = activities.map(activity => ({
            id: activity._id,
            type: activity.type,
            description: activity.description,
            time: formatTime(activity.createdAt),
            user: activity.userId ? {
                name: activity.userId.name,
                email: activity.userId.email
            } : null,
            metadata: activity.metadata
        }));

        res.json({
            success: true,
            data: {
                activities: formattedActivities,
                total: await Activity.countDocuments()
            }
        });
    } catch (error) {
        console.error('Get recent activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 }),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all items
// @route   GET /api/admin/items
// @access  Private/Admin
exports.getAllItems = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            type,
            status,
            search = ''
        } = req.query;

        const skip = (page - 1) * limit;

        let query = {};

        // Add filters
        if (type) query.category = type;
        if (status) query.status = status;

        // Add search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [items, total] = await Promise.all([
            Item.find(query)
                .populate('postedBy', 'name email')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 }),
            Item.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                items,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all items error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update item status
// @route   PUT /api/admin/items/:id/status
// @access  Private/Admin
exports.updateItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const item = await Item.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Update item
        item.status = status;
        if (adminNotes) item.adminNotes = adminNotes;
        item.updatedBy = req.admin._id;

        await item.save();

        // Log activity
        await Activity.create({
            type: 'item',
            action: 'status_update',
            description: `Item "${item.title}" status updated to ${status}`,
            adminId: req.admin._id,
            itemId: item._id,
            metadata: { oldStatus: item.status, newStatus: status }
        });

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Update item status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Helper function to format time
const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
};