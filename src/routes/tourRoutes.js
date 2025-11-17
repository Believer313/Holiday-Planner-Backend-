const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

const {
  createTour,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour
} = require('../controllers/tourController');

const auth = require('../middlewares/auth');
const permit = require('../middlewares/permit');

// Public routes
router.get('/', getAllTours);
router.get('/:id', getTourById);

// Admin routes with Cloudinary image upload
router.post('/', auth, permit('admin'), upload.array('images', 5), createTour);
router.put('/:id', auth, permit('admin'), upload.array('images', 5), updateTour);
router.delete('/:id', auth, permit('admin'), deleteTour);

module.exports = router;
