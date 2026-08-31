import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Helper function to format cart items and totals
const formatCart = (cart) => {
  let calculatedCartTotal = 0;

  const formattedItems = cart.items.map((item) => {
    const product = item.product;

    // If product was deleted from DB
    if (!product || typeof product !== 'object') {
      return {
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
        priceAtAdd: item.priceAtAdd,
        currentPrice: null,
        calculatedItemTotal: 0,
        priceChanged: false,
        stockAvailable: 0,
        isAvailable: false,
      };
    }

    const currentPrice = product.price;
    const calculatedItemTotal = item.quantity * currentPrice;
    const priceChanged = item.priceAtAdd !== currentPrice;
    const isAvailable =
      product.status === 'active' && product.quantityAvailable >= item.quantity;

    if (isAvailable) {
      calculatedCartTotal += calculatedItemTotal;
    }

    return {
      _id: item._id,
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        images: product.images,
        farmer: product.farmer,
        status: product.status,
        quantityAvailable: product.quantityAvailable,
      },
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
      currentPrice,
      calculatedItemTotal,
      priceChanged,
      stockAvailable: product.quantityAvailable,
      isAvailable,
    };
  });

  return {
    _id: cart._id,
    buyer: cart.buyer,
    items: formattedItems,
    calculatedCartTotal,
    updatedAt: cart.updatedAt,
  };
};

// @desc    Get authenticated buyer's cart
// @route   GET /api/cart
// @access  Private (Buyer)
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ buyer: req.user._id, items: [] });
    }

    const formatted = formatCart(cart);

    return res.status(200).json({
      success: true,
      cart: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message,
    });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart/items
// @access  Private (Buyer)
export const addToCart = async (req, res) => {
  try {
    const { product: productId, quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required',
      });
    }

    const numQuantity = Number(quantity);
    if (!quantity || isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number greater than 0',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.status !== 'active' || product.quantityAvailable <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is unavailable or out of stock',
      });
    }

    let cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) {
      cart = new Cart({ buyer: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += numQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: numQuantity,
        priceAtAdd: product.price,
      });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    return res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while adding item to cart',
      error: error.message,
    });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:productId
// @access  Private (Buyer)
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required',
      });
    }

    const numQuantity = Number(quantity);
    if (quantity === undefined || quantity === null || isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number greater than 0',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (numQuantity > product.quantityAvailable) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${numQuantity}) exceeds available stock (${product.quantityAvailable})`,
      });
    }

    let cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    existingItem.quantity = numQuantity;
    // Note: priceAtAdd is kept unchanged as per requirement

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart item',
      error: error.message,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private (Buyer)
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required',
      });
    }

    let cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while removing item from cart',
      error: error.message,
    });
  }
};

// @desc    Clear all items from cart
// @route   DELETE /api/cart
// @access  Private (Buyer)
export const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) {
      cart = await Cart.create({ buyer: req.user._id, items: [] });
    } else {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while clearing cart',
      error: error.message,
    });
  }
};
