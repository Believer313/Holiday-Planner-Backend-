const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // For logged-in users
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: false },

  // For public (non-logged-in) bookings
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  destination: { type: String },
  travelers: { type: Number },
  specialRequests: { type: String },

  // Common fields
  travelDate: { type: Date, required: true },
  totalPersons: { type: Number },
  amount: { type: Number, default: 0 },
  
  // Status fields
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);