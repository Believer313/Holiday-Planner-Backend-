// controllers/bookingController.js — FINAL WITH EMAIL
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const sendEmail = require('../utils/sendEmail'); // ← ADD THIS

// Existing authenticated booking
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

// PUBLIC BOOKING + EMAIL TO CUSTOMER & ADMIN
module.exports.createPublicBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      destination,
      travelDate,
      travelers,
      specialRequests
    } = req.body;

    if (!name || !email || !phone || !destination || !travelDate || !travelers) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const booking = await Booking.create({
      name,
      email,
      phone,
      destination,
      travelDate: new Date(travelDate),
      travelers: Number(travelers),
      specialRequests: specialRequests || '',
      paymentStatus: 'pending',
      amount: 0,
      user: null,
      tour: null
    });

    // EMAIL 1: To Customer (Beautiful Confirmation)
    try {
      await sendEmail({
        to: email,
        subject: 'We Received Your Booking Request!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #f9f9f9;">
            <h1 style="color: #FFD700; text-align: center;">Thank You, ${name}!</h1>
            <p style="font-size: 16px;">Your booking request has been received successfully.</p>
            <hr>
            <h3>Your Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Destination:</strong> ${destination}</li>
              <li><strong>Travel Date:</strong> ${new Date(travelDate).toDateString()}</li>
              <li><strong>Travelers:</strong> ${travelers}</li>
              <li><strong>Phone:</strong> ${phone}</li>
              ${specialRequests ? `<li><strong>Special Request:</strong> ${specialRequests}</li>` : ''}
            </ul>
            <p style="background: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold;">
              Our team will call you within 2 hours to confirm!
            </p>
            <p style="text-align: center; color: #666; font-size: 12px;">
              Holiday Planner Tours & Travels<br>
              Call: +91 98765 43210 | Email: info@holidayplanner.com
            </p>
          </div>
        `
      });
    } catch (err) {
      console.log("Customer email failed (but booking saved)");
    }

    // EMAIL 2: To Admin (Instant Alert)
    try {
      await sendEmail({
        to: process.env.EMAIL_USER, // Your email
        subject: `NEW BOOKING - ${destination} (${travelers} pax)`,
        html: `
          <div style="font-family: Arial; background: #fff; padding: 20px; border: 2px solid #FFD700;">
            <h2 style="color: #FFD700;">NEW PUBLIC BOOKING!</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Date:</strong> ${new Date(travelDate).toDateString()}</p>
            <p><strong>Travelers:</strong> ${travelers}</p>
            ${specialRequests ? `<p><strong>Request:</strong> ${specialRequests}</p>` : ''}
            <hr>
            <p style="color: green; font-weight: bold;">Call them NOW!</p>
          </  >
        `
      });
    } catch (err) {
      console.log("Admin email failed");
    }

    res.status(201).json({
      success: true,
      message: 'Booking received! We will contact you soon.',
      booking
    });

  } catch (err) {
    console.error('Public booking error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Other functions remain same
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