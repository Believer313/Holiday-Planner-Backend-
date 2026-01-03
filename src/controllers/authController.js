// controllers/authController.js — FINAL VERSION (ADMIN EMPIRE READY)
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || 'your_jwt_secret', {
    expiresIn: '7d'
  });
};

// ==================== REGISTER USER ====================
module.exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const finalRole = (role && role.toLowerCase() === 'admin') ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || undefined,
      role: finalRole,
      isBlocked: false  // ← Make sure new users are not blocked
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==================== LOGIN USER ====================
module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account is blocked. Contact admin.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==================== FORGOT & RESET PASSWORD (UNCHANGED) ====================
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    res.json({ message: 'Reset link generated!', resetURL });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be 6+ characters' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Link expired or invalid' });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== ADMIN ONLY: USERS MANAGEMENT ====================

// 1. Get All Users
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -resetToken -resetTokenExpiry');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Update User Role (Make Admin / Demote)
module.exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be user or admin' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: `User is now ${role.toUpperCase()}`, user });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Block / Unblock User
module.exports.blockUnblockUser = async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: isBlocked ? 'User blocked' : 'User unblocked',
      user
    });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};