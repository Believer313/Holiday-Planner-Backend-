// controllers/tourController.js — UPDATED to match frontend requirements
const Tour = require('../models/Tour');
const cloudinary = require('../utils/cloudinary');

// Helper function to parse textarea input into array
const parseToList = (str) => {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  return str.split('\n').filter(item => item.trim().length > 0);
};

// Helper function to parse itinerary from textarea
const parseItinerary = (str) => {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  
  const lines = str.split('\n').filter(l => l.trim());
  const itinerary = [];
  
  for (let i = 0; i < lines.length; i += 3) {
    if (lines[i]) {
      itinerary.push({
        day: lines[i].trim(),
        title: lines[i+1] ? lines[i+1].trim() : '',
        desc: lines[i+2] ? lines[i+2].trim() : ''
      });
    }
  }
  
  return itinerary;
};

const createTour = async (req, res) => {
  try {
    const {
      title,
      destination,
      duration,
      groupSize,
      experience,
      price,
      shortDescription,
      description,
      highlights,
      includes,
      excludes,
      itinerary,
      imageCover
    } = req.body;

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
      duration: duration || "3 Days / 2 Nights",
      groupSize: groupSize || "Max 12 Travelers",
      experience: experience || "Premium",
      price: Number(price),
      shortDescription: shortDescription || description?.substring(0, 150),
      description,
      highlights: parseToList(highlights),
      includes: parseToList(includes),
      excludes: parseToList(excludes),
      itinerary: parseItinerary(itinerary),
      imageCover: imageCover || (images[0] || ""),
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
    const updateData = { ...req.body };
    
    // Parse fields if they come as strings
    if (updateData.highlights && typeof updateData.highlights === 'string') {
      updateData.highlights = parseToList(updateData.highlights);
    }
    if (updateData.includes && typeof updateData.includes === 'string') {
      updateData.includes = parseToList(updateData.includes);
    }
    if (updateData.excludes && typeof updateData.excludes === 'string') {
      updateData.excludes = parseToList(updateData.excludes);
    }
    if (updateData.itinerary && typeof updateData.itinerary === 'string') {
      updateData.itinerary = parseItinerary(updateData.itinerary);
    }
    
    const tour = await Tour.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json(tour);
  } catch (err) {
    console.error('Update tour error:', err);
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

module.exports = {
  createTour,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour
};