const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['lost', 'found']
  },

  location: { type: String, required: true },
  exactLocation: { type: String, default: "" },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'matched', 'claimed', 'returned', 'closed'],
    default: 'pending'
  },
  image: { type: String, default: "" },
  contactInfo: { type: String, required: true },
  color: { type: String, default: "" },
  brand: { type: String, default: "" },

  // Smart matching fields
  keywords: [{ type: String }],
  matchScore: { type: Number, default: 0 },
  matchedItems: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    score: { type: Number },
    matchReason: { type: String }
  }],

  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },

  // For found items - claim details
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedAt: { type: Date },
  handoverLocation: { type: String },
  handoverDate: { type: Date }
}, { timestamps: true });

// Add text index for search
itemSchema.index({ title: 'text', description: 'text', keywords: 'text' });

module.exports = mongoose.model("Item", itemSchema);