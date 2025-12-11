require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lost-found-system")
    .then(() => console.log("✅ MongoDB Connected (Main Server)"))
    .catch(err => console.log("❌ DB Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/admin", adminRoutes);

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Main Server is running",
        port: 5000,
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

// Start on PORT 5000
const PORT = 5000;  // Fixed port for admin
app.listen(PORT, () => {
    console.log(`🚀 Admin Server running on port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/health`);
});