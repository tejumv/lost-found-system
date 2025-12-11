const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No authentication token, access denied' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find admin by id
        const admin = await Admin.findById(decoded.id).select('-password');
        
        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin not found' 
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin account is deactivated' 
            });
        }

        // Attach admin to request
        req.admin = admin;
        req.token = token;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Token is not valid' 
        });
    }
};

module.exports = adminMiddleware;