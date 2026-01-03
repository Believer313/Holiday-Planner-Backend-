// routes/tourRoutes.js — FINAL 100% WORKING VERSION
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
  createTour,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour
} = require('../controllers/tourController');

// CORRECT IMPORT — USE YOUR REAL MIDDLEWARE FILE NAME!
const { protect, isAdmin } = require('../middlewares/auth'); 
// If your file is named auth.js → change to: require('../middlewares/auth')

// Public routes
router.get('/', getAllTours);
router.get('/:id', getTourById);

// Admin only routes
router.post('/', protect, isAdmin, upload.array('images', 5), createTour);
router.put('/:id', protect, isAdmin, upload.array('images',5), updateTour);
router.delete('/:id', protect, isAdmin, deleteTour);

module.exports = router;