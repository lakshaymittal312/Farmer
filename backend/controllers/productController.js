import mongoose from 'mongoose';
import Product from '../models/Product.js';
import FarmerProfile from '../models/FarmerProfile.js';
import Category from '../models/Category.js';
import { checkAndNotifyLowStock } from '../services/notificationService.js';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Farmer only)
export const createProduct = async (req, res) => {
  try {
    // 1. Verify user is a farmer
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can create products',
      });
    }

    // 2. Find authenticated user's FarmerProfile
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (!farmerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile is required to list products. Please create a farmer profile first.',
      });
    }

    const {
      name,
      category,
      description,
      price,
      unit,
      quantityAvailable,
      images,
      isOrganic,
      harvestDate,
      status,
    } = req.body;

    // 3. Validate required fields presence
    if (!name || !category || !description || price === undefined || !unit || quantityAvailable === undefined || !images) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, category, description, price, unit, quantityAvailable, images',
      });
    }

    // 4. Validate category reference
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Specified category does not exist',
      });
    }

    // 5. Validate numerical constraints & image array
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number',
      });
    }
    if (typeof quantityAvailable !== 'number' || quantityAvailable < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity available must be a non-negative number',
      });
    }
    if (!Array.isArray(images) || images.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'At least one image URL is required',
      });
    }

    const allowedUnits = ['kg', 'quintal', 'dozen', 'piece', 'litre'];
    if (!allowedUnits.includes(unit)) {
      return res.status(400).json({
        success: false,
        message: `Invalid unit. Allowed units are: ${allowedUnits.join(', ')}`,
      });
    }

    if (status && !['active', 'inactive', 'out_of_stock'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values are: active, inactive, out_of_stock',
      });
    }

    // 6. Build product data with automatic farmer assignment and location population
    let initialStatus = status || 'active';
    if (quantityAvailable === 0 && initialStatus === 'active') {
      initialStatus = 'out_of_stock';
    }

    const productData = {
      name: name.trim(),
      category,
      description: description.trim(),
      price,
      unit,
      quantityAvailable,
      images,
      farmer: farmerProfile._id, // Set automatically from authenticated user's profile
      location: {
        village: farmerProfile.village,
        district: farmerProfile.district,
        state: farmerProfile.state,
      }, // Populated automatically from FarmerProfile
      isOrganic: Boolean(isOrganic),
      harvestDate: harvestDate ? new Date(harvestDate) : null,
      status: initialStatus,
      rating: 0, // Cannot be set by client
    };

    const product = await Product.create(productData);
    await product.populate([
      { path: 'category', select: 'name description' },
      { path: 'farmer', select: 'farmName village district state rating' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
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
      message: 'Server error creating product',
      error: error.message,
    });
  }
};

// @desc    Get all products with filtering options
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const filter = {};

    // Filter by Category
    if (req.query.category) {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.category = req.query.category;
      }
    }

    // Filter by Location (District, State, Village or general location string)
    if (req.query.district) {
      filter['location.district'] = new RegExp(req.query.district, 'i');
    }
    if (req.query.state) {
      filter['location.state'] = new RegExp(req.query.state, 'i');
    }
    if (req.query.village) {
      filter['location.village'] = new RegExp(req.query.village, 'i');
    }
    if (req.query.location) {
      const locRegex = new RegExp(req.query.location, 'i');
      filter['$or'] = [
        { 'location.district': locRegex },
        { 'location.state': locRegex },
        { 'location.village': locRegex },
      ];
    }

    // Filter by Organic status
    if (req.query.isOrganic !== undefined) {
      filter.isOrganic = req.query.isOrganic === 'true' || req.query.isOrganic === true;
    }

    // Filter by Product status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const products = await Product.find(filter)
      .populate('category', 'name description')
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

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id)
      .populate('category', 'name description')
      .populate('farmer', 'farmName village district state rating');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving product',
      error: error.message,
    });
  }
};

// @desc    Update a product (Owning farmer only)
// @route   PUT /api/products/:id
// @access  Private (Farmer owner)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Authenticated user must be a farmer and own this product
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update products',
      });
    }

    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (!farmerProfile || product.farmer.toString() !== farmerProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product. You can only modify your own products.',
      });
    }

    const updates = { ...req.body };

    // Strip/protect non-updatable fields
    delete updates.farmer;
    delete updates.rating;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Validate category if provided
    if (updates.category) {
      if (!mongoose.Types.ObjectId.isValid(updates.category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID format',
        });
      }
      const categoryExists = await Category.findById(updates.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Specified category does not exist',
        });
      }
    }

    // Validate price if provided
    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number',
      });
    }

    // Validate quantityAvailable if provided
    if (updates.quantityAvailable !== undefined && (typeof updates.quantityAvailable !== 'number' || updates.quantityAvailable < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity available must be a non-negative number',
      });
    }

    // Validate images if provided
    if (updates.images !== undefined && (!Array.isArray(updates.images) || updates.images.length < 1)) {
      return res.status(400).json({
        success: false,
        message: 'At least one image URL is required',
      });
    }

    // Synchronize location with farmer profile
    updates.location = {
      village: farmerProfile.village,
      district: farmerProfile.district,
      state: farmerProfile.state,
    };

    // Handle stock status logic
    const currentQty = updates.quantityAvailable !== undefined ? updates.quantityAvailable : product.quantityAvailable;
    if (currentQty === 0 && (!updates.status || updates.status === 'active')) {
      updates.status = 'out_of_stock';
    } else if (currentQty > 0 && product.status === 'out_of_stock' && !updates.status) {
      updates.status = 'active';
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('category', 'name description')
      .populate('farmer', 'farmName village district state rating');

    if (updatedProduct && farmerProfile) {
      await checkAndNotifyLowStock(updatedProduct, farmerProfile);
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
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
      message: 'Server error updating product',
      error: error.message,
    });
  }
};

// @desc    Delete product (Owning farmer only)
// @route   DELETE /api/products/:id
// @access  Private (Farmer owner)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Authenticated user must be a farmer and own this product
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete products',
      });
    }

    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (!farmerProfile || product.farmer.toString() !== farmerProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product. You can only delete your own products.',
      });
    }

    await Product.findByIdAndDelete(product._id);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting product',
      error: error.message,
    });
  }
};
