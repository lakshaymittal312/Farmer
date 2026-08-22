import mongoose from 'mongoose';
import FarmerProfile from '../models/FarmerProfile.js';

// @desc    Create farmer profile for logged-in user
// @route   POST /api/farmer-profiles
// @access  Private
export const createFarmerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if farmer profile already exists for this user
    const existingProfile = await FarmerProfile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'A farmer profile already exists for this user',
      });
    }

    const {
      farmName,
      farmDescription,
      village,
      district,
      state,
      pincode,
      farmingType,
      cropsGrown,
      verificationDocs,
      bankDetails,
    } = req.body;

    // Required fields validation
    if (!farmName || !village || !district || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: farmName, village, district, state, pincode',
      });
    }

    // Guard sensitive fields: non-admins cannot set rating, totalOrders, totalRevenue, or verificationStatus
    const profileData = {
      user: userId,
      farmName,
      farmDescription: farmDescription || '',
      village,
      district,
      state,
      pincode,
      farmingType: farmingType || 'conventional',
      cropsGrown: Array.isArray(cropsGrown) ? cropsGrown : [],
      verificationDocs: Array.isArray(verificationDocs) ? verificationDocs : [],
      bankDetails: bankDetails || {},
      verificationStatus: req.user.role === 'admin' && req.body.verificationStatus ? req.body.verificationStatus : 'pending',
      rating: 0,
      totalOrders: 0,
      totalRevenue: 0,
    };

    const profile = await FarmerProfile.create(profileData);
    await profile.populate('user', 'name email phone role profileImage');

    return res.status(201).json({
      success: true,
      message: 'Farmer profile created successfully',
      data: profile,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A farmer profile already exists for this user',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error creating farmer profile',
      error: error.message,
    });
  }
};

// @desc    Get logged-in farmer profile
// @route   GET /api/farmer-profiles/me
// @access  Private
export const getLoggedInFarmerProfile = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email phone role profileImage'
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found for this user',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving logged-in farmer profile',
      error: error.message,
    });
  }
};

// @desc    Get all verified farmers
// @route   GET /api/farmer-profiles/verified
// @access  Public
export const getVerifiedFarmers = async (req, res) => {
  try {
    const profiles = await FarmerProfile.find({ verificationStatus: 'verified' }).populate(
      'user',
      'name email phone role profileImage'
    );

    return res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving verified farmer profiles',
      error: error.message,
    });
  }
};

// @desc    Get farmer profile by ID (Profile ID or User ID)
// @route   GET /api/farmer-profiles/:id
// @access  Public / Private
export const getFarmerProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile or user ID format',
      });
    }

    // Search by profile ID first, then fallback to user ID
    let profile = await FarmerProfile.findById(id).populate(
      'user',
      'name email phone role profileImage'
    );

    if (!profile) {
      profile = await FarmerProfile.findOne({ user: id }).populate(
        'user',
        'name email phone role profileImage'
      );
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving farmer profile',
      error: error.message,
    });
  }
};

// @desc    Update farmer profile (own profile or admin)
// @route   PUT /api/farmer-profiles/me or PUT /api/farmer-profiles/:id
// @access  Private
export const updateFarmerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let profile;

    if (!id || id === 'me') {
      profile = await FarmerProfile.findOne({ user: req.user._id });
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile ID format',
        });
      }
      profile = await FarmerProfile.findById(id);
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found',
      });
    }

    // Check authorization: must be owner or admin
    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this farmer profile',
      });
    }

    const updates = { ...req.body };

    // Strip sensitive / admin-controlled fields if updated by normal user
    if (req.user.role !== 'admin') {
      delete updates.verificationStatus;
      delete updates.rating;
      delete updates.totalOrders;
      delete updates.totalRevenue;
      delete updates.user;
    }

    // Handle bankDetails merge if provided
    if (updates.bankDetails) {
      updates.bankDetails = {
        ...profile.bankDetails?.toObject(),
        ...updates.bankDetails,
      };
    }

    const updatedProfile = await FarmerProfile.findByIdAndUpdate(
      profile._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone role profileImage');

    return res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully',
      data: updatedProfile,
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
      message: 'Server error updating farmer profile',
      error: error.message,
    });
  }
};

// @desc    Update farmer verification status (Admin only)
// @route   PATCH /api/farmer-profiles/:id/verification-status
// @access  Private (Admin)
export const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID format',
      });
    }

    if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Allowed values: pending, verified, rejected',
      });
    }

    const profile = await FarmerProfile.findByIdAndUpdate(
      id,
      { verificationStatus },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone role profileImage');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Farmer verification status updated to '${verificationStatus}'`,
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating verification status',
      error: error.message,
    });
  }
};

// @desc    Delete farmer profile
// @route   DELETE /api/farmer-profiles/me or DELETE /api/farmer-profiles/:id
// @access  Private
export const deleteFarmerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let profile;

    if (!id || id === 'me') {
      profile = await FarmerProfile.findOne({ user: req.user._id });
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile ID format',
        });
      }
      profile = await FarmerProfile.findById(id);
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found',
      });
    }

    // Check authorization: must be owner or admin
    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this farmer profile',
      });
    }

    await FarmerProfile.findByIdAndDelete(profile._id);

    return res.status(200).json({
      success: true,
      message: 'Farmer profile deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting farmer profile',
      error: error.message,
    });
  }
};
