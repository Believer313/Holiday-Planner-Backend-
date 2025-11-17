const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createOrder } = require('../controllers/paymentController');

// Protected route for creating a payment order
router.post('/create-order', auth, createOrder);

module.exports = router;
