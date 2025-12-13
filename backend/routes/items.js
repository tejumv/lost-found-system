const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Report item with image upload
router.post("/add", auth, upload.single('image'), itemController.reportItem);

// Get user's items
router.get("/my-items", auth, itemController.getUserItems);

// Get all items (public)
router.get("/all", itemController.getAllItems);

// Get item by ID
router.get("/:id", itemController.getItemById);

// Claim item
router.post("/claim", auth, itemController.claimItem);

// Mark as returned
router.post("/return", auth, itemController.markAsReturned);

// Get stats
router.get("/stats/my", auth, itemController.getStats);

// === ADD THIS LINE FOR DEBUGGING ===
router.get("/debug/all", itemController.debugAllItems);
// Add this line in your routes/items.js
router.get("/test/my-items", auth, itemController.testUserItems);
// ===================================

module.exports = router;