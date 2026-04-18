const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const sendEmail = require('../utils/sendEmail');
const { getAllAdminEmails } = require('../utils/getAdmin');
const { 
  sendBookingReceivedSMS,
  sendBookingConfirmedSMS,
  sendBookingCancelledSMS,
  notifyAdminsNewBooking
} = require('../utils/sendSMS');

// PUBLIC BOOKING - With Email + SMS to Customer AND All Admins
module.exports.createPublicBooking = async (req, res) => {
  try {
    const {
      name, email, phone, destination, travelDate, travelers, specialRequests
    } = req.body;

    if (!name || !email || !phone || !destination || !travelDate || !travelers) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Save booking to database
    const booking = await Booking.create({
      name, email, phone, destination,
      travelDate: new Date(travelDate),
      travelers: Number(travelers),
      specialRequests: specialRequests || '',
      paymentStatus: 'pending',
      status: 'pending',
      amount: 0
    });

    // ========== 1. SEND TO CUSTOMER ==========
    
    // 1A. Email to Customer
    try {
      await sendEmail({
        to: email,
        subject: '✅ Booking Received - Holiday Planner',
        html: `
          <div style="font-family: Arial; max-width: 550px; margin: auto; padding: 25px; border: 2px solid #d4af37; border-radius: 15px;">
            <h2 style="color: #064e3b;">Thank You, ${name}! 🎉</h2>
            <p>Your booking request has been <strong style="color: #10b981;">successfully received</strong>.</p>
            <hr>
            <h3>📋 Booking Details:</h3>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Travel Date:</strong> ${new Date(travelDate).toDateString()}</p>
            <p><strong>Travelers:</strong> ${travelers}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            ${specialRequests ? `<p><strong>Special Request:</strong> ${specialRequests}</p>` : ''}
            <hr>
            <p style="background: #d4af37; color: #064e3b; padding: 12px; border-radius: 8px; text-align: center;">
              📞 Our team will call you within 2 hours to confirm your booking!
            </p>
            <p style="text-align: center; font-size: 12px; color: #666;">
              Holiday Planner Tours and Travels<br>
              📱 +91 9907740169 | ✉️ nazmussayadatmona@gmail.com
            </p>
          </div>
        `
      });
      console.log(`✅ Customer email sent to ${email}`);
    } catch (err) {
      console.log('Customer email failed:', err.message);
    }

    // 1B. SMS to Customer
    try {
      await sendBookingReceivedSMS(phone, name, destination);
      console.log(`✅ Customer SMS sent to ${phone}`);
    } catch (err) {
      console.log('Customer SMS failed:', err.message);
    }

    // ========== 2. SEND TO ALL ADMINS ==========
    
    // Send notification to all admins (email + SMS)
    try {
      await notifyAdminsNewBooking({
        name, email, phone, destination, travelDate, travelers, specialRequests
      });
      console.log(`✅ Admin notifications sent`);
    } catch (err) {
      console.log('Admin notification failed:', err.message);
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

// UPDATE BOOKING STATUS - With Email + SMS to Customer
module.exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();
    
    // Send notification to customer based on status
    if (status === 'confirmed') {
      // Email to Customer
      try {
        await sendEmail({
          to: booking.email,
          subject: '🎉 Your Booking is CONFIRMED! - Holiday Planner',
          html: `
            <div style="font-family: Arial; max-width: 550px; margin: auto; padding: 25px; border: 2px solid #10b981; border-radius: 15px;">
              <h2 style="color: #10b981;">Booking CONFIRMED! ✅</h2>
              <p>Dear <strong>${booking.name}</strong>,</p>
              <p>Great news! Your booking for <strong>${booking.destination}</strong> has been <strong style="color: #10b981;">CONFIRMED</strong>.</p>
              <p><strong>Travel Date:</strong> ${new Date(booking.travelDate).toDateString()}</p>
              <p><strong>Travelers:</strong> ${booking.travelers}</p>
              <p>We are excited to have you! Our team will share more details soon.</p>
              <br>
              <p>Thank you for choosing Holiday Planner!</p>
            </div>
          `
        });
        console.log(`✅ Confirmation email sent to ${booking.email}`);
      } catch (err) {
        console.log('Confirmation email failed:', err.message);
      }
      
      // SMS to Customer
      try {
        await sendBookingConfirmedSMS(booking.phone, booking.name, booking.destination, booking.travelDate);
        console.log(`✅ Confirmation SMS sent to ${booking.phone}`);
      } catch (err) {
        console.log('Confirmation SMS failed:', err.message);
      }
      
    } else if (status === 'cancelled') {
      // Email to Customer
      try {
        await sendEmail({
          to: booking.email,
          subject: '❌ Booking Cancelled - Holiday Planner',
          html: `
            <div style="font-family: Arial; max-width: 550px; margin: auto; padding: 25px; border: 2px solid #ef4444; border-radius: 15px;">
              <h2 style="color: #ef4444;">Booking Cancelled ❌</h2>
              <p>Dear <strong>${booking.name}</strong>,</p>
              <p>We regret to inform you that your booking for <strong>${booking.destination}</strong> has been <strong style="color: #ef4444;">CANCELLED</strong>.</p>
              <p>Please contact us at +919907740169 for assistance or to rebook.</p>
              <br>
              <p>We apologize for any inconvenience caused.</p>
            </div>
          `
        });
        console.log(`✅ Cancellation email sent to ${booking.email}`);
      } catch (err) {
        console.log('Cancellation email failed:', err.message);
      }
      
      // SMS to Customer
      try {
        await sendBookingCancelledSMS(booking.phone, booking.name, booking.destination);
        console.log(`✅ Cancellation SMS sent to ${booking.phone}`);
      } catch (err) {
        console.log('Cancellation SMS failed:', err.message);
      }
    }
    
    res.json({ success: true, booking, message: `Booking ${status} successfully!` });
  } catch (err) {
    next(err);
  }
};

// GET ALL BOOKINGS
module.exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('tour', 'title price')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      name: booking.name || booking.user?.name || 'Guest',
      email: booking.email || booking.user?.email || 'No email',
      phone: booking.phone || 'No phone',
      destination: booking.destination || booking.tour?.title || 'Unknown',
      travelDate: booking.travelDate,
      travelers: booking.travelers || booking.totalPersons || 1,
      specialRequests: booking.specialRequests || '',
      status: booking.status || 'pending',
      amount: booking.amount || 0,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt
    }));
    
    res.json(formattedBookings);
  } catch (err) {
    next(err);
  }
};

// GET USER BOOKINGS
module.exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId }).populate('tour');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// AUTHENTICATED BOOKING
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
      paymentStatus: 'pending',
      status: 'pending'
    });
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};