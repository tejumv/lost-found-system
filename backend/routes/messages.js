const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

// Send message
router.post("/send", auth, messageController.sendMessage);

// Get conversation
router.get("/conversation", auth, messageController.getConversation);

// Get all conversations
router.get("/conversations", auth, messageController.getAllConversations);

module.exports = router;