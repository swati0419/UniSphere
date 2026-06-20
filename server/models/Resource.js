 const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['lost', 'found', 'sell', 'donate', 'borrow'], required: true },
    category: { type: String, enum: ['books', 'electronics', 'stationery', 'clothing', 'other'], default: 'other' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactInfo: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
