const express = require('express');
const router = express.Router();

const {
  createBooking,
  createPublicBooking,
  getUserBookings,
  getAllBookings
} = require('../controllers/bookingController');

const { protect } = require('../middlewares/auth');   // <-- FIX
const permit = require('../middlewares/permit');

// PUBLIC ROUTE
router.post('/public', createPublicBooking);

// AUTHENTICATED ROUTES
router.post('/', protect, createBooking);
router.get('/user/:userId', protect, getUserBookings);
router.get('/', protect, permit('admin'), getAllBookings);

module.exports = router;
