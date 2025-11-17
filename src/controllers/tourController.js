const Tour = require('../models/Tour');
const slugify = require('slugify');
const cloudinary = require('../utils/cloudinary'); // our Cloudinary config

// Create a new tour
module.exports.createTour = async (req, res, next) => {
  try {
    const { title, destination, durationDays, price, shortDescription, description } = req.body;

    // Upload images if any
    let images = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'holiday_planner', // optional folder in Cloudinary
        });
        images.push(result.secure_url); // store Cloudinary URL
      }
    }

    const slug = slugify(title, { lower: true });
    const tour = await Tour.create({
      title,
      slug,
      destination,
      durationDays,
      price,
      shortDescription,
      description,
      images,
      createdBy: req.user._id, // assuming JWT auth middleware sets req.user
    });

    res.status(201).json(tour);
  } catch (err) {
    next(err);
  }
};

// Get all tours
module.exports.getAllTours = async (req, res, next) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.json(tours);
  } catch (err) {
    next(err);
  }
};

// Get tour by ID
module.exports.getTourById = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json(tour);
  } catch (err) {
    next(err);
  }
};

// Update tour
module.exports.updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json(tour);
  } catch (err) {
    next(err);
  }
};

// Delete tour
module.exports.deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json({ message: 'Tour deleted successfully' });
  } catch (err) {
    next(err);
  }
};
