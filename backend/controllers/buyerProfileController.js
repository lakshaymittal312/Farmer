import mongoose from 'mongoose';
import BuyerProfile from '../models/BuyerProfile.js';

// Helper to get or create logged-in user's buyer profile
const getProfileForUser = async (userId) => {
  return await BuyerProfile.findOne({ user: userId });
};

// @desc    Create buyer profile for logged-in user
// @route   POST /api/buyer-profiles
// @access  Private
export const createBuyerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check duplicate profile
    const existingProfile = await BuyerProfile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'A buyer profile already exists for this user',
      });
    }

    const { deliveryAddresses, preferredCategories, wishlist } = req.body;

    const profileData = {
      user: userId,
      deliveryAddresses: Array.isArray(deliveryAddresses) ? deliveryAddresses : [],
      preferredCategories: Array.isArray(preferredCategories) ? preferredCategories : [],
      wishlist: Array.isArray(wishlist) ? wishlist : [],
      totalOrders: 0,
    };

    // Ensure only one default address if addresses passed
    if (profileData.deliveryAddresses.length > 0) {
      let hasDefault = false;
      profileData.deliveryAddresses = profileData.deliveryAddresses.map((addr) => {
        if (addr.isDefault && !hasDefault) {
          hasDefault = true;
          return { ...addr, isDefault: true };
        }
        return { ...addr, isDefault: false };
      });
      if (!hasDefault && profileData.deliveryAddresses.length > 0) {
        profileData.deliveryAddresses[0].isDefault = true;
      }
    }

    const profile = await BuyerProfile.create(profileData);
    await profile.populate('user', 'name email phone role profileImage');

    return res.status(201).json({
      success: true,
      message: 'Buyer profile created successfully',
      data: profile,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A buyer profile already exists for this user',
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
      message: 'Server error creating buyer profile',
      error: error.message,
    });
  }
};

// @desc    Get logged-in buyer profile
// @route   GET /api/buyer-profiles/me
// @access  Private
export const getLoggedInBuyerProfile = async (req, res) => {
  try {
    let query = BuyerProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email phone role profileImage'
    );

    if (mongoose.models.Product) {
      query = query.populate('wishlist');
    }

    const profile = await query;

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found for this user',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving logged-in buyer profile',
      error: error.message,
    });
  }
};

// @desc    Get buyer profile by ID (Profile ID or User ID)
// @route   GET /api/buyer-profiles/:id
// @access  Public / Private
export const getBuyerProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile or user ID format',
      });
    }

    let query1 = BuyerProfile.findById(id).populate(
      'user',
      'name email phone role profileImage'
    );
    if (mongoose.models.Product) query1 = query1.populate('wishlist');

    let profile = await query1;

    if (!profile) {
      let query2 = BuyerProfile.findOne({ user: id }).populate(
        'user',
        'name email phone role profileImage'
      );
      if (mongoose.models.Product) query2 = query2.populate('wishlist');
      profile = await query2;
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving buyer profile',
      error: error.message,
    });
  }
};

// @desc    Update buyer profile (own profile or admin)
// @route   PUT /api/buyer-profiles/me or PUT /api/buyer-profiles/:id
// @access  Private
export const updateBuyerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let profile;

    if (!id || id === 'me') {
      profile = await BuyerProfile.findOne({ user: req.user._id });
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile ID format',
        });
      }
      profile = await BuyerProfile.findById(id);
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    // Check ownership
    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this buyer profile',
      });
    }

    const updates = { ...req.body };
    if (req.user.role !== 'admin') {
      delete updates.totalOrders;
      delete updates.user;
    }

    let query = BuyerProfile.findByIdAndUpdate(
      profile._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone role profileImage');

    if (mongoose.models.Product) {
      query = query.populate('wishlist');
    }

    const updatedProfile = await query;

    return res.status(200).json({
      success: true,
      message: 'Buyer profile updated successfully',
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
      message: 'Server error updating buyer profile',
      error: error.message,
    });
  }
};

// @desc    Delete buyer profile
// @route   DELETE /api/buyer-profiles/me or DELETE /api/buyer-profiles/:id
// @access  Private
export const deleteBuyerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let profile;

    if (!id || id === 'me') {
      profile = await BuyerProfile.findOne({ user: req.user._id });
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile ID format',
        });
      }
      profile = await BuyerProfile.findById(id);
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this buyer profile',
      });
    }

    await BuyerProfile.findByIdAndDelete(profile._id);

    return res.status(200).json({
      success: true,
      message: 'Buyer profile deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting buyer profile',
      error: error.message,
    });
  }
};

// @desc    Add delivery address
// @route   POST /api/buyer-profiles/addresses or POST /api/buyer-profiles/me/addresses
// @access  Private
export const addDeliveryAddress = async (req, res) => {
  try {
    const profile = await getProfileForUser(req.user._id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found. Please create a profile first.',
      });
    }

    const { label, address, city, state, pincode, isDefault } = req.body;

    if (!label || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address fields: label, address, city, state, pincode',
      });
    }

    // If marked as default or first address, reset others
    const shouldBeDefault = isDefault || profile.deliveryAddresses.length === 0;

    if (shouldBeDefault) {
      profile.deliveryAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    profile.deliveryAddresses.push({
      label,
      address,
      city,
      state,
      pincode,
      isDefault: shouldBeDefault,
    });

    await profile.save();

    return res.status(201).json({
      success: true,
      message: 'Delivery address added successfully',
      data: profile.deliveryAddresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error adding delivery address',
      error: error.message,
    });
  }
};

// @desc    Update delivery address
// @route   PUT /api/buyer-profiles/addresses/:addressId
// @access  Private
export const updateDeliveryAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID format',
      });
    }

    const profile = await getProfileForUser(req.user._id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    const addressSubdoc = profile.deliveryAddresses.id(addressId);

    if (!addressSubdoc) {
      return res.status(404).json({
        success: false,
        message: 'Delivery address not found',
      });
    }

    const { label, address, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      profile.deliveryAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    if (label !== undefined) addressSubdoc.label = label;
    if (address !== undefined) addressSubdoc.address = address;
    if (city !== undefined) addressSubdoc.city = city;
    if (state !== undefined) addressSubdoc.state = state;
    if (pincode !== undefined) addressSubdoc.pincode = pincode;
    if (isDefault !== undefined) addressSubdoc.isDefault = isDefault;

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Delivery address updated successfully',
      data: profile.deliveryAddresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating delivery address',
      error: error.message,
    });
  }
};

// @desc    Delete delivery address
// @route   DELETE /api/buyer-profiles/addresses/:addressId
// @access  Private
export const deleteDeliveryAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID format',
      });
    }

    const profile = await getProfileForUser(req.user._id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    const addressSubdoc = profile.deliveryAddresses.id(addressId);

    if (!addressSubdoc) {
      return res.status(404).json({
        success: false,
        message: 'Delivery address not found',
      });
    }

    const wasDefault = addressSubdoc.isDefault;
    addressSubdoc.deleteOne();

    if (wasDefault && profile.deliveryAddresses.length > 0) {
      profile.deliveryAddresses[0].isDefault = true;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Delivery address deleted successfully',
      data: profile.deliveryAddresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting delivery address',
      error: error.message,
    });
  }
};

// @desc    Set default delivery address
// @route   PATCH /api/buyer-profiles/addresses/:addressId/default or PUT
// @access  Private
export const setDefaultDeliveryAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID format',
      });
    }

    const profile = await getProfileForUser(req.user._id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    const targetAddress = profile.deliveryAddresses.id(addressId);

    if (!targetAddress) {
      return res.status(404).json({
        success: false,
        message: 'Delivery address not found',
      });
    }

    profile.deliveryAddresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Default delivery address updated successfully',
      data: profile.deliveryAddresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error setting default delivery address',
      error: error.message,
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/buyer-profiles/wishlist
// @access  Private
export const addWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Validate Product existence if Product model exists in Mongoose
    if (mongoose.models.Product) {
      const productExists = await mongoose.models.Product.findById(productId);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
    }

    const profile = await getProfileForUser(req.user._id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found. Please create a profile first.',
      });
    }

    // Check if already in wishlist
    const exists = profile.wishlist.some((id) => id.toString() === productId.toString());
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Product is already in wishlist',
      });
    }

    profile.wishlist.push(productId);
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: profile.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error adding product to wishlist',
      error: error.message,
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/buyer-profiles/wishlist/:productId
// @access  Private
export const removeWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const profile = await getProfileForUser(req.user._id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    const initialLength = profile.wishlist.length;
    profile.wishlist = profile.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );

    if (profile.wishlist.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist',
      });
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist successfully',
      data: profile.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error removing product from wishlist',
      error: error.message,
    });
  }
};
