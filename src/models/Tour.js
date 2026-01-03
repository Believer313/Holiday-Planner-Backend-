// models/Tour.js  ← ONLY THIS
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: String,
  destination: { type: String, required: true },
  durationDays: { type: Number, default: 1 },
  price: { type: Number, required: true },
  shortDescription: String,
  description: String,
  images: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

tourSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Tour', tourSchema);