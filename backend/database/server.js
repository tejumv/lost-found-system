require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lost-found-system")
    .then(() => console.log("✅ MongoDB Connected (Database Server)"))
    .catch(err => console.log("❌ DB Error:", err));

// Database-specific routes
app.get("/db/health", (req, res) => {
    res.json({
        success: true,
        message: "Database Server is running",
        port: 5001,
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

// Database testing endpoints
app.get("/db/users", async (req, res) => {
    try {
        // Example: Get all users from database
        const users = await mongoose.connection.db.collection("users").find({}).toArray();
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start on PORT 5001
const PORT = 5001;  // Different port!
app.listen(PORT, () => {
    console.log(`🗄️  Database Server running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/db/health`);
});