const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['lost', 'found']
  },
  status: {
    type: String,
    enum: ['pending', 'found', 'returned'],
    default: 'pending'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactInfo: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Add text index for search
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
