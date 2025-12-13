const Admin = require("../models/Admin");
const User = require("../models/User");
const Item = require("../models/Item");
const Activity = require("../models/Activity");

/* ================= LOGIN ================= */
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = admin.getSignedJwtToken();

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
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= DASHBOARD STATS ================= */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const lostItems = await Item.countDocuments({ category: "lost" });
    const foundItems = await Item.countDocuments({ category: "found" });
    const pendingItems = await Item.countDocuments({ status: "pending" });
    const resolvedItems = await Item.countDocuments({ status: "resolved" });

    res.json({
      success: true,
      data: {
        totalUsers,
        lostItems,
        foundItems,
        pendingApproval: pendingItems,
        resolvedCases: resolvedItems
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Dashboard error" });
  }
};

/* ================= RECENT ACTIVITY ================= */
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: {
        activities
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Activity error" });
  }
};

/* ================= USERS ================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Users error" });
  }
};

/* ================= ITEMS ================= */
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        items
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Items error" });
  }
};

/* ================= UPDATE ITEM ================= */
exports.updateItemStatus = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    item.status = req.body.status;
    await item.save();

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update error" });
  }
};
