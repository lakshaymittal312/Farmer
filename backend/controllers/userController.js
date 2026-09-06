import User from '../models/User.js';

// @desc    Get logged in user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile',
      error: error.message,
    });
  }
};

// @desc    Update logged in user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const updates = { ...req.body };

    // Strip protected / sensitive fields that MUST NOT be updated via profile update
    delete updates.role;
    delete updates.password;
    delete updates.isVerified;
    delete updates.isActive;
    delete updates.permissions;
    delete updates.rating;
    delete updates.totalRevenue;
    delete updates.totalOrders;
    delete updates.verificationStatus;
    delete updates._id;

    if (updates.name) user.name = updates.name.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    if (updates.profileImage !== undefined) user.profileImage = updates.profileImage;
    if (updates.address !== undefined) user.address = updates.address;
    if (updates.city !== undefined) user.city = updates.city;
    if (updates.state !== undefined) user.state = updates.state;
    if (updates.pincode !== undefined) user.pincode = updates.pincode;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        pincode: updatedUser.pincode,
        isVerified: updatedUser.isVerified,
        isActive: updatedUser.isActive,
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
      message: 'Server error updating user profile',
      error: error.message,
    });
  }
};
