const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Handle multiple recipients
  let recipients = options.to;
  if (Array.isArray(options.to)) {
    recipients = options.to.join(', ');
  }

  const mailOptions = {
    from: `"Holiday Planner Tour & Travels" <${process.env.EMAIL_USER}>`,
    to: recipients,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;