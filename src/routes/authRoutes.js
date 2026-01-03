// routes/authRoutes.js — FINAL VERSION (Admin Ready)
const express = require('express');
const router = express.Router();

// Import all auth controllers
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getAllUsers,          // NEW: Get all users (admin only)
  updateUserRole,       // NEW: Make someone admin/user
  blockUnblockUser      // NEW: Block/unblock user
} = require('../controllers/authController');

// Middleware
const { protect, isAdmin } = require('../middlewares/auth');

// ==================== PUBLIC ROUTES ====================
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ==================== ADMIN ONLY ROUTES ====================
router.get('/users', protect, isAdmin, getAllUsers);                    // Get all users
router.patch('/users/:id/role', protect, isAdmin, updateUserRole);      // Change role
router.patch('/users/:id/block', protect, isAdmin, blockUnblockUser);   // Block/unblock

module.exports = router;