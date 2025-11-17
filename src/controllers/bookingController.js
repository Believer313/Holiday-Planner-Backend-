const Booking = require('../models/Booking');
const Tour = require('../models/Tour');

module.exports.createBooking = async (req, res, next) => {
  try {
    const { tourId, travelDate, totalPersons } = req.body;

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });

    const amount = tour.price * totalPersons;

    const booking = await Booking.create({
      user: req.user._id,
      tour: tourId,
      travelDate,
      totalPersons,
      amount,
      paymentStatus: 'pending'
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

module.exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId }).populate('tour');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

module.exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('tour').populate('user');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};
