import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.activeOnly === 'true' || req.query.isActive === 'true') {
      filter.isActive = true;
    } else if (req.query.all !== 'true' && req.user?.role !== 'admin') {
      filter.isActive = true;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving categories',
      error: error.message,
    });
  }
};

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    let category;
    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findById(id);
    }

    if (!category) {
      category = await Category.findOne({ slug: id.toLowerCase() });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving category',
      error: error.message,
    });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, slug, icon, description, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      icon: icon ? icon.trim() : '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    if (slug) {
      categoryData.slug = slug.toLowerCase().trim();
    }

    const category = await Category.create(categoryData);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name or slug already exists',
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
      message: 'Server error creating category',
      error: error.message,
    });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const updates = { ...req.body };
    if (updates.name) updates.name = updates.name.trim();
    if (updates.slug) updates.slug = updates.slug.toLowerCase().trim();
    if (updates.description) updates.description = updates.description.trim();
    if (updates.icon) updates.icon = updates.icon.trim();

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name or slug already exists',
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
      message: 'Server error updating category',
      error: error.message,
    });
  }
};

// @desc    Delete a category (prevents unsafe deletion if products exist)
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Safety check: Prevent deleting category referenced by active/existing products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category '${category.name}'. It is referenced by ${productCount} existing product(s).`,
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting category',
      error: error.message,
    });
  }
};
