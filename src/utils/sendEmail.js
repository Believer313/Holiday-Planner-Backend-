// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use your Gmail or any SMTP (Gmail example below)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,     // → your email
      pass: process.env.EMAIL_PASS      // → App Password (NOT normal password)
    }
  });

  const mailOptions = {
    from: `"Holiday Planner Tour & Travels" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;