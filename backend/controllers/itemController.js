const Item = require("../models/Item");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/items/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'item-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
}).single('image');

// Add Item with image upload
exports.addItem = async (req, res) => {
  // Handle file upload first
  upload(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // Get data from form
      const { itemName, category, description, location, date } = req.body;

      // Validation
      if (!itemName || !category || !description || !location || !date) {
        return res.status(400).json({
          success: false,
          message: 'Please fill all required fields'
        });
      }

      // Create item data object
      const itemData = {
        itemName: itemName,
        description: description,
        category: category,
        location: location,
        date: date,
        contactInfo: req.user.email || req.user.contactInfo, // Get from authenticated user
        postedBy: req.user._id
      };

      // Add image path if uploaded
      if (req.file) {
        // Save relative path for frontend access
        itemData.image = `/uploads/items/${path.basename(req.file.path)}`;
      }

      // Create and save item
      const item = new Item(itemData);
      await item.save();

      // Populate user info
      const populatedItem = await Item.findById(item._id).populate('postedBy', 'name email');

      res.status(201).json({
        success: true,
        message: "Item reported successfully",
        item: populatedItem
      });
    } catch (error) {
      console.error('Add item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  });
};

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("postedBy", "name email")
      .populate("claimedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const items = await Item.find({ category })
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's items
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};