const express = require('express');
const router = express.Router();

const {
  createBooking,
  getUserBookings,
  getAllBookings
} = require('../controllers/bookingController');

const auth = require('../middlewares/auth');
const permit = require('../middlewares/permit');

// User routes
router.post('/', auth, createBooking);
router.get('/user/:userId', auth, getUserBookings);

// Admin routes
router.get('/', auth, permit('admin'), getAllBookings);

module.exports = router;
