const Tour = require('../models/Tour');
const slugify = require('slugify');

module.exports.createTour = async (req, res, next) => {
  try {
    const { title, destination, durationDays, price, shortDescription, description, images } = req.body;
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
      createdBy: req.user._id
    });
    res.status(201).json(tour);
  } catch (err) {
    next(err);
  }
};

module.exports.getAllTours = async (req, res, next) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.json(tours);
  } catch (err) {
    next(err);
  }
};

module.exports.getTourById = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json(tour);
  } catch (err) {
    next(err);
  }
};

module.exports.updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json(tour);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json({ message: 'Tour deleted successfully' });
  } catch (err) {
    next(err);
  }
};
