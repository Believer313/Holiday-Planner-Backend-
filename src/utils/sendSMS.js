const twilio = require('twilio');

let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const sendSMS = async (to, message) => {
  if (!to) return { success: false, error: 'No phone number provided' };
  
  const cleanPhone = (phone) => {
    const cleaned = phone.toString().replace(/\D/g, '');
    if (cleaned.length === 10) return '+91' + cleaned;
    if (cleaned.length === 12 && cleaned.startsWith('91')) return '+' + cleaned;
    if (!cleaned.startsWith('+')) return '+' + cleaned;
    return cleaned;
  };

  // Handle multiple recipients
  let recipients = Array.isArray(to) ? to : [to];
  
  const results = [];
  for (const recipient of recipients) {
    const finalPhone = cleanPhone(recipient);
    
    if (process.env.NODE_ENV !== 'production' || !client) {
      console.log(`📱 SMS to ${finalPhone}: ${message}`);
      results.push({ success: true, message: 'SMS logged (development mode)' });
    } else {
      try {
        const result = await client.messages.create({
          body: message,
          to: finalPhone,
          from: process.env.TWILIO_PHONE_NUMBER
        });
        console.log(`✅ SMS sent to ${finalPhone}: ${result.sid}`);
        results.push({ success: true, sid: result.sid });
      } catch (error) {
        console.error(`SMS failed to ${finalPhone}:`, error.message);
        results.push({ success: false, error: error.message });
      }
    }
  }
  
  return { success: true, results };
};

// Send to ALL admins
const sendToAllAdmins = async (getRecipientsFn, messageBuilder, bookingData) => {
  const { getAdminEmails, getAdminPhones } = require('./getAdmins');
  
  // For email
  if (messageBuilder.email) {
    const adminEmails = await getAdminEmails();
    if (adminEmails.length > 0) {
      return sendEmail({
        to: adminEmails,
        subject: messageBuilder.email.subject,
        html: messageBuilder.email.html(bookingData)
      });
    }
  }
  
  // For SMS
  if (messageBuilder.sms) {
    const adminPhones = await getAdminPhones();
    if (adminPhones.length > 0) {
      return sendSMS(adminPhones, messageBuilder.sms(bookingData));
    }
  }
};

// SMS 1: Booking Received - To Customer Only
const sendBookingReceivedSMS = async (phone, name, destination) => {
  const message = `🏝️ Holiday Planner Tour & Travels: Thank you ${name}! We have received your booking request for ${destination}. Our team will contact you within 2 hours to confirm. Call +919907740169 for any queries.`;
  return sendSMS(phone, message);
};

// SMS 2: Booking Confirmed - To Customer
const sendBookingConfirmedSMS = async (phone, name, destination, travelDate) => {
  const dateStr = travelDate ? new Date(travelDate).toLocaleDateString() : 'your selected date';
  const message = `✅ Holiday Planner Tour & Travels: Congratulations ${name}! Your booking for ${destination} on ${dateStr} is CONFIRMED! 🎉 Get ready for an amazing trip. Call +919907740169 for any questions.`;
  return sendSMS(phone, message);
};

// SMS 3: Booking Cancelled - To Customer
const sendBookingCancelledSMS = async (phone, name, destination) => {
  const message = `❌ Holiday Planner Tour & Travels: Dear ${name}, your booking for ${destination} has been CANCELLED. Please contact us at +919907740169 for assistance.`;
  return sendSMS(phone, message);
};

// NOTIFICATION TO ALL ADMINS - New Booking Alert
const notifyAdminsNewBooking = async (bookingData) => {
  const { getAdminEmails, getAdminPhones } = require('./getAdmins');
  const sendEmail = require('./sendEmail');
  
  const adminEmails = await getAdminEmails();
  if (adminEmails.length > 0) {
    await sendEmail({
      to: adminEmails,
      subject: `🔔 NEW BOOKING - ${bookingData.destination} (${bookingData.travelers} pax)`,
      html: `
        <div style="font-family: Arial; background: #fff; padding: 20px; border: 2px solid #FFD700;">
          <h2 style="color: #FFD700;">🆕 NEW PUBLIC BOOKING!</h2>
          <p><strong>Name:</strong> ${bookingData.name}</p>
          <p><strong>Email:</strong> ${bookingData.email}</p>
          <p><strong>Phone:</strong> ${bookingData.phone}</p>
          <p><strong>Destination:</strong> ${bookingData.destination}</p>
          <p><strong>Date:</strong> ${new Date(bookingData.travelDate).toDateString()}</p>
          <p><strong>Travelers:</strong> ${bookingData.travelers}</p>
          ${bookingData.specialRequests ? `<p><strong>Request:</strong> ${bookingData.specialRequests}</p>` : ''}
          <hr>
          <p style="color: green; font-weight: bold;">📞 Call them NOW!</p>
          <p style="margin-top: 20px;"><a href="${process.env.FRONTEND_URL}/admin/bookings" style="background: #064e3b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Dashboard →</a></p>
        </div>
      `
    });
  }
  
  // SMS to all admins (if they have phone numbers)
  const adminPhones = await getAdminPhones();
  if (adminPhones.length > 0) {
    const message = `🔔 NEW BOOKING! ${bookingData.name} booked ${bookingData.destination} for ${bookingData.travelers} pax. Customer phone: ${bookingData.phone}. Check dashboard now!`;
    await sendSMS(adminPhones, message);
  }
};

// NOTIFICATION TO ALL ADMINS - Status Update
const notifyAdminsStatusUpdate = async (bookingData, oldStatus, newStatus) => {
  const { getAdminEmails, getAdminPhones } = require('./getAdmins');
  const sendEmail = require('./sendEmail');
  
  const statusIcon = newStatus === 'confirmed' ? '✅' : newStatus === 'cancelled' ? '❌' : '⏳';
  const statusColor = newStatus === 'confirmed' ? '#10b981' : newStatus === 'cancelled' ? '#ef4444' : '#f59e0b';
  
  const adminEmails = await getAdminEmails();
  if (adminEmails.length > 0) {
    await sendEmail({
      to: adminEmails,
      subject: `${statusIcon} Booking ${newStatus.toUpperCase()} - ${bookingData.destination}`,
      html: `
        <div style="font-family: Arial; background: #fff; padding: 20px; border: 2px solid ${statusColor};">
          <h2 style="color: ${statusColor};">${statusIcon} Booking ${newStatus.toUpperCase()}!</h2>
          <p><strong>Customer:</strong> ${bookingData.name}</p>
          <p><strong>Destination:</strong> ${bookingData.destination}</p>
          <p><strong>Phone:</strong> ${bookingData.phone}</p>
          <p><strong>Status Changed:</strong> ${oldStatus} → ${newStatus}</p>
          <hr>
          <p><a href="${process.env.FRONTEND_URL}/admin/bookings" style="background: #064e3b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Dashboard →</a></p>
        </div>
      `
    });
  }
  
  // SMS to all admins
  const adminPhones = await getAdminPhones();
  if (adminPhones.length > 0) {
    const message = `${statusIcon} Booking ${newStatus.toUpperCase()}! ${bookingData.name} - ${bookingData.destination}. Customer: ${bookingData.phone}`;
    await sendSMS(adminPhones, message);
  }
};

module.exports = {
  sendSMS,
  sendBookingReceivedSMS,
  sendBookingConfirmedSMS,
  sendBookingCancelledSMS,
  notifyAdminsNewBooking,
  notifyAdminsStatusUpdate
};
