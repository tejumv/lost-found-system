const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ["lost", "found"] },
  status: { type: String, enum: ["pending", "found", "returned"], default: "pending" },
  location: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  image: { type: String, default: "" },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contactInfo: { type: String, required: true }
}, { timestamps: true });

// Enable search
itemSchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("Item", itemSchema);
