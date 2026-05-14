const express = require('express');
const router = express.Router();
// const { protect } = require('../middlewares/auth');   // ← Commented out

const { createOrder } = require('../controllers/paymentController');

// Public route - No protection needed for customers
router.post('/create-order', createOrder);

module.exports = router;