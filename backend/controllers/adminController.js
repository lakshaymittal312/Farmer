import mongoose from 'mongoose';
import User from '../models/User.js';
import FarmerProfile from '../models/FarmerProfile.js';
import BuyerProfile from '../models/BuyerProfile.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter['$or'] = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving users',
      error: error.message,
    });
  }
};

// @desc    Update user status (activate / deactivate)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive status boolean is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: Boolean(isActive) },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User status updated to ${user.isActive ? 'active' : 'deactivated'}`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating user status',
      error: error.message,
    });
  }
};

// @desc    Get all farmer profiles
// @route   GET /api/admin/farmers
// @access  Private (Admin)
export const getFarmers = async (req, res) => {
  try {
    const farmers = await FarmerProfile.find()
      .populate('user', 'name email phone role profileImage isActive isVerified')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: farmers.length,
      data: farmers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving farmer profiles',
      error: error.message,
    });
  }
};

// @desc    Get all buyer profiles
// @route   GET /api/admin/buyers
// @access  Private (Admin)
export const getBuyers = async (req, res) => {
  try {
    const buyers = await BuyerProfile.find()
      .populate('user', 'name email phone role profileImage isActive isVerified')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: buyers.length,
      data: buyers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving buyer profiles',
      error: error.message,
    });
  }
};

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private (Admin)
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name slug')
      .populate('farmer', 'farmName village district state rating')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving products',
      error: error.message,
    });
  }
};

// @desc    Get all orders across system for admin
// @route   GET /api/admin/orders
// @access  Private (Admin)
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'name email phone')
      .populate('farmer', 'farmName village district state rating')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving orders',
      error: error.message,
    });
  }
};

// @desc    Get analytics / summary report
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalyticsSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await FarmerProfile.countDocuments();
    const totalBuyers = await BuyerProfile.countDocuments();
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });

    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFarmers,
        totalBuyers,
        totalProducts,
        activeProducts,
        totalOrders,
        deliveredOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving analytics summary',
      error: error.message,
    });
  }
};
