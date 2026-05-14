const razorpay = require('../utils/razorpay');

// Create a payment order
module.exports.createOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Amount must be at least ₹1" 
      });
    }

    const options = {
      amount: Math.round(amount * 100), 
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // ✅ Important: Send key_id to frontend
    res.status(201).json({ 
      success: true, 
      order,
      key_id: process.env.RAZORPAY_KEY_ID 
    });

  } catch (err) {
    console.error("Razorpay Order Error:", err);
    next(err);
  }
};