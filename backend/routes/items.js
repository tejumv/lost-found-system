const express = require("express");
const { addItem, getItems, getItemsByCategory, getMyItems } = require("../controllers/itemController");
const auth = require("../middleware/auth");

const router = express.Router();

// Protected routes (require login)
router.post("/add", auth, addItem);
router.get("/my-items", auth, getMyItems);

// Public routes
router.get("/", getItems);
router.get("/category/:category", getItemsByCategory);

module.exports = router;