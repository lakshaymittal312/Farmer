import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'farm_connect_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (farmer or buyer)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone',
      });
    }

    const userRole = role || 'buyer';
    if (!['farmer', 'buyer'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role for registration. Public registration allows only farmer or buyer.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      role: userRole,
      isVerified: true,
      isActive: true,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    // Check bcrypt password or fallback for unhashed existing accounts
    let isMatch = await user.matchPassword(password);
    if (!isMatch && user.password === password) {
      isMatch = true;
      // Automatically upgrade password to bcrypt hash
      user.password = password;
      await user.save();
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving current user profile',
      error: error.message,
    });
  }
};
