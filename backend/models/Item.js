const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    category: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },

    itemType: { type: String },
    location: { type: String },
    exactLocation: { type: String },
    date: { type: Date },
    contactInfo: { type: String },

    color: String,
    brand: String,
    image: String,

    // ✅ CORRECT FIELD (used everywhere)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: String,
    userEmail: String,

    status: {
      type: String,
      enum: ["pending", "matched", "claimed", "returned", "archived"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
