const express = require('express');
const router = express.Router();

const {
  createTour,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour
} = require('../controllers/tourController');

const auth = require('../middlewares/auth');
const permit = require('../middlewares/permit');

// Public route
router.get('/', getAllTours);
router.get('/:id', getTourById);

// Admin routes
router.post('/', auth, permit('admin'), createTour);
router.put('/:id', auth, permit('admin'), updateTour);
router.delete('/:id', auth, permit('admin'), deleteTour);

module.exports = router;
