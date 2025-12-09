const Item = require("../models/Item");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only .jpeg, .jpg, .png files are allowed"));
  },
}).single("image");

// Add item with image upload
const addItem = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Image size should be less than 5MB",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const { title, description, category, location, date, contactInfo } =
        req.body;

      // Validate required fields
      if (!title || !description || !category || !location || !date || !contactInfo) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Validate contact number
      if (!/^\d{10}$/.test(contactInfo)) {
        return res.status(400).json({
          success: false,
          message: "Contact number must be 10 digits",
        });
      }

      // Validate date
      const itemDate = new Date(date);
      const today = new Date();
      if (itemDate > today) {
        return res.status(400).json({
          success: false,
          message: "Date cannot be in the future",
        });
      }

      // Check if image was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image",
        });
      }

      // Create new item
      const newItem = new Item({
        title,
        description,
        category,
        location,
        date: itemDate,
        contactInfo,
        postedBy: req.user.id,
        image: `/uploads/${req.file.filename}`,
      });

      await newItem.save();

      res.status(201).json({
        success: true,
        message: "Item reported successfully",
        item: newItem,
      });
    } catch (error) {
      console.error("Error adding item:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  });
};

// Get all items
const getItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user's items
const getUserItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user.id })
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Error fetching user items:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addItem,
  getItems,
  getUserItems,
};