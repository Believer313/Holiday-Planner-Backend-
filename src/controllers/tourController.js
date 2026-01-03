// controllers/tourController.js — FINAL VERSION THAT WORKS 100%
const Tour = require('../models/Tour');
const cloudinary = require('../utils/cloudinary');

const createTour = async (req, res) => {
  try {
    const { title, destination, durationDays, price, shortDescription, description } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'holiday_planner',
        });
        images.push(result.secure_url);
      }
    }

    const tour = await Tour.create({
      title,
      destination,
      durationDays: Number(durationDays) || 1,
      price: Number(price),
      shortDescription,
      description,
      images,
      createdBy: req.user._id,
    });

    res.status(201).json(tour);
  } catch (err) {
    console.error('Create tour error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json({ message: 'Tour deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// THIS IS THE ONLY CORRECT WAY
module.exports = {
  createTour,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour
};