const razorpay = require('../utils/razorpay');

// Create a payment order
module.exports.createOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
