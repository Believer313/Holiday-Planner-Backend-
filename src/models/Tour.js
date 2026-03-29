// models/Tour.js — Matches frontend TourDetails display
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  slug: String,
  destination: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: String, 
    required: true,
    default: "3 Days / 2 Nights"
  },
  groupSize: { 
    type: String, 
    default: "Max 12 Travelers" 
  },
  experience: { 
    type: String, 
    default: "Premium" 
  },
  price: { 
    type: Number, 
    required: true 
  },
  shortDescription: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  highlights: { 
    type: [String], 
    default: [] 
  },
  includes: { 
    type: [String], 
    default: [] 
  },
  excludes: { 
    type: [String], 
    default: [] 
  },
  itinerary: { 
    type: [{
      day: String,
      title: String,
      desc: String
    }], 
    default: [] 
  },
  imageCover: { 
    type: String, 
    default: "" 
  },
  images: [String],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

tourSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Tour', tourSchema);