const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: String,
  destination: { type: String, required: true },
  durationDays: { type: Number, default: 1 },
  price: { type: Number, required: true },
  shortDescription: String,
  description: String,
  images: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema);
