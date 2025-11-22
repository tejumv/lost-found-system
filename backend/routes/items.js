const express = require("express");
const { addItem, getItems } = require("../controllers/itemController");
const auth = require("../middleware/auth");

const router = express.Router();

// Protected route
router.post("/add", auth, addItem);

// Public route
router.get("/", getItems);

module.exports = router;
