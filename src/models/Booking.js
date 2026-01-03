const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Keep existing for logged-in users
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: false },

  // NEW: Fields for public (non-logged-in) bookings
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  destination: { type: String },
  travelers: { type: Number },
  specialRequests: { type: String },

  // Common fields
  travelDate: { type: Date, required: true },
  totalPersons: { type: Number },  // for logged-in bookings
  amount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);