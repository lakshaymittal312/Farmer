import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import FarmerProfile from '../models/FarmerProfile.js';
import BuyerProfile from '../models/BuyerProfile.js';
import User from '../models/User.js';
import { createNotification, checkAndNotifyLowStock } from '../services/notificationService.js';

// @desc    Checkout / Create Order(s) from Cart
// @route   POST /api/orders
// @access  Private (Buyer)
export const checkout = async (req, res) => {
  try {
    const buyerId = req.user._id;

    // Step 1 & 2: Load buyer's cart and verify not empty
    const cart = await Cart.findOne({ buyer: buyerId }).populate('items.product');
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add items to cart before checkout.',
      });
    }

    // Step 3: Obtain delivery address
    let deliveryAddress = req.body.deliveryAddress;
    if (!deliveryAddress || !deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
      const buyerProfile = await BuyerProfile.findOne({ user: buyerId });
      if (buyerProfile && buyerProfile.deliveryAddresses && buyerProfile.deliveryAddresses.length > 0) {
        const defaultAddr = buyerProfile.deliveryAddresses.find((addr) => addr.isDefault) || buyerProfile.deliveryAddresses[0];
        deliveryAddress = {
          label: defaultAddr.label || 'Home',
          address: defaultAddr.address,
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode,
        };
      } else if (req.user.address && req.user.city && req.user.state && req.user.pincode) {
        deliveryAddress = {
          label: 'Home',
          address: req.user.address,
          city: req.user.city,
          state: req.user.state,
          pincode: req.user.pincode,
        };
      } else {
        return res.status(400).json({
          success: false,
          message: 'Delivery address is required (address, city, state, pincode)',
        });
      }
    }

    // Step 4: Verify products exist, are active, and have sufficient stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product reference no longer exists`,
        });
      }
      if (product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product '${product.name}' is inactive and cannot be ordered`,
        });
      }
      if (product.quantityAvailable < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product '${product.name}'. Available: ${product.quantityAvailable}, Requested: ${item.quantity}`,
        });
      }
    }

    // Step 5: Group cart items by FarmerProfile
    const farmerGroups = {};
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id || item.product);
      const farmerIdStr = product.farmer.toString();
      if (!farmerGroups[farmerIdStr]) {
        farmerGroups[farmerIdStr] = [];
      }
      farmerGroups[farmerIdStr].push({
        item,
        product,
      });
    }

    // Check if MongoDB deployment supports replica set transactions
    let useTransaction = false;
    let session = null;
    try {
      if (mongoose.connection.client.topology && mongoose.connection.client.topology.description.type !== 'Single') {
        session = await mongoose.startSession();
        session.startTransaction();
        useTransaction = true;
      }
    } catch (e) {
      useTransaction = false;
      session = null;
    }

    const createdOrders = [];
    const updatedProducts = [];

    if (useTransaction && session) {
      try {
        for (const farmerIdStr of Object.keys(farmerGroups)) {
          const group = farmerGroups[farmerIdStr];
          const orderItems = [];
          let totalAmount = 0;

          for (const { item, product } of group) {
            const freshProduct = await Product.findById(product._id).session(session);
            if (freshProduct.quantityAvailable < item.quantity) {
              throw new Error(`Insufficient stock for '${product.name}'`);
            }
            freshProduct.quantityAvailable -= item.quantity;
            if (freshProduct.quantityAvailable === 0) {
              freshProduct.status = 'out_of_stock';
            }
            await freshProduct.save({ session });

            const itemPrice = freshProduct.price;
            totalAmount += itemPrice * item.quantity;

            orderItems.push({
              product: freshProduct._id,
              name: freshProduct.name,
              price: itemPrice,
              quantity: item.quantity,
              unit: freshProduct.unit,
            });
          }

          const paymentMethod = req.body.paymentMethod === 'online' ? 'online' : 'COD';
          const [newOrder] = await Order.create(
            [
              {
                buyer: buyerId,
                farmer: farmerIdStr,
                items: orderItems,
                deliveryAddress,
                totalAmount,
                paymentStatus: 'pending',
                paymentMethod,
                orderStatus: 'pending',
                statusHistory: [{ status: 'pending', changedAt: new Date(), changedBy: buyerId }],
              },
            ],
            { session }
          );

          createdOrders.push(newOrder);
          await FarmerProfile.findByIdAndUpdate(farmerIdStr, { $inc: { totalOrders: 1 } }, { session });
        }

        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();
        session.endSession();

        await BuyerProfile.findOneAndUpdate({ user: buyerId }, { $inc: { totalOrders: createdOrders.length } });

        // Trigger notifications for order_placed and check product_low_stock
        for (const order of createdOrders) {
          const farmerProfile = await FarmerProfile.findById(order.farmer);
          if (farmerProfile && farmerProfile.user) {
            await createNotification({
              receiver: farmerProfile.user,
              type: 'order_placed',
              message: 'You received a new order.',
              relatedOrder: order._id,
            });
            for (const item of order.items) {
              const p = await Product.findById(item.product);
              if (p) {
                await checkAndNotifyLowStock(p, farmerProfile);
              }
            }
          }
        }

        return res.status(201).json({
          success: true,
          message: 'Order(s) created successfully',
          orders: createdOrders,
        });
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Checkout failed',
          error: err.message,
        });
      }
    } else {
      // Standalone execution with atomic updates and rollback
      try {
        for (const farmerIdStr of Object.keys(farmerGroups)) {
          const group = farmerGroups[farmerIdStr];
          const orderItems = [];
          let totalAmount = 0;

          for (const { item, product } of group) {
            const updatedProduct = await Product.findOneAndUpdate(
              {
                _id: product._id,
                quantityAvailable: { $gte: item.quantity },
                status: 'active',
              },
              {
                $inc: { quantityAvailable: -item.quantity },
              },
              { new: true }
            );

            if (!updatedProduct) {
              // Rollback previous stock decrements
              for (const p of updatedProducts) {
                await Product.findByIdAndUpdate(p.id, {
                  $inc: { quantityAvailable: p.quantity },
                  status: 'active',
                });
              }
              return res.status(400).json({
                success: false,
                message: `Insufficient stock or concurrent update for product '${product.name}'`,
              });
            }

            if (updatedProduct.quantityAvailable === 0) {
              updatedProduct.status = 'out_of_stock';
              await updatedProduct.save();
            }

            updatedProducts.push({ id: product._id, quantity: item.quantity });

            const itemPrice = product.price;
            totalAmount += itemPrice * item.quantity;

            orderItems.push({
              product: product._id,
              name: product.name,
              price: itemPrice,
              quantity: item.quantity,
              unit: product.unit,
            });
          }

          const paymentMethod = req.body.paymentMethod === 'online' ? 'online' : 'COD';
          const newOrder = await Order.create({
            buyer: buyerId,
            farmer: farmerIdStr,
            items: orderItems,
            deliveryAddress,
            totalAmount,
            paymentStatus: 'pending',
            paymentMethod,
            orderStatus: 'pending',
            statusHistory: [{ status: 'pending', changedAt: new Date(), changedBy: buyerId }],
          });

          createdOrders.push(newOrder);
          await FarmerProfile.findByIdAndUpdate(farmerIdStr, { $inc: { totalOrders: 1 } });
        }

        cart.items = [];
        await cart.save();

        await BuyerProfile.findOneAndUpdate({ user: buyerId }, { $inc: { totalOrders: createdOrders.length } });

        // Trigger notifications for order_placed and check product_low_stock
        for (const order of createdOrders) {
          const farmerProfile = await FarmerProfile.findById(order.farmer);
          if (farmerProfile && farmerProfile.user) {
            await createNotification({
              receiver: farmerProfile.user,
              type: 'order_placed',
              message: 'You received a new order.',
              relatedOrder: order._id,
            });
            for (const item of order.items) {
              const p = await Product.findById(item.product);
              if (p) {
                await checkAndNotifyLowStock(p, farmerProfile);
              }
            }
          }
        }

        return res.status(201).json({
          success: true,
          message: 'Order(s) created successfully',
          orders: createdOrders,
        });
      } catch (err) {
        // Rollback any stock updates if order creation throws
        for (const p of updatedProducts) {
          await Product.findByIdAndUpdate(p.id, {
            $inc: { quantityAvailable: p.quantity },
            status: 'active',
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Checkout failed',
          error: err.message,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during checkout',
      error: error.message,
    });
  }
};

// @desc    Get orders (supports ?buyer=me, ?farmer=me or role-based filtering)
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const filter = {};

    if (req.query.buyer === 'me' || req.user.role === 'buyer') {
      filter.buyer = req.user._id;
    } else if (req.query.farmer === 'me' || req.user.role === 'farmer') {
      const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
      if (!farmerProfile) {
        return res.status(404).json({
          success: false,
          message: 'Farmer profile not found',
        });
      }
      filter.farmer = farmerProfile._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view orders',
      });
    }

    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('buyer', 'name email phone')
      .populate('farmer', 'farmName village district state pincode rating')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: error.message,
    });
  }
};

// @desc    Get buyer's own orders
// @route   GET /api/orders/my-orders
// @access  Private (Buyer)
export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('farmer', 'farmName village district state pincode rating')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching buyer orders',
      error: error.message,
    });
  }
};

// @desc    Get orders belonging to authenticated farmer
// @route   GET /api/orders/farmer
// @access  Private (Farmer)
export const getFarmerOrders = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (!farmerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found for authenticated user',
      });
    }

    const orders = await Order.find({ farmer: farmerProfile._id })
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching farmer orders',
      error: error.message,
    });
  }
};

// @desc    Get single order details by ID
// @route   GET /api/orders/:id
// @access  Private (Buyer owner, Farmer owner, or Admin)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid order ID is required',
      });
    }

    const order = await Order.findById(id)
      .populate('buyer', 'name email phone')
      .populate('farmer', 'farmName village district state pincode rating');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization: buyer owner, farmer owner, or admin
    const isBuyerOwner = order.buyer._id.toString() === req.user._id.toString();
    let isFarmer = false;
    if (req.user.role === 'farmer') {
      const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
      isFarmer = farmerProfile && order.farmer._id.toString() === farmerProfile._id.toString();
    }
    const isAdmin = req.user.role === 'admin';

    if (!isBuyerOwner && !isFarmer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching order',
      error: error.message,
    });
  }
};

// @desc    Buyer cancels own order (Allowed only when status is pending or accepted)
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Buyer)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, cancelReason } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid order ID is required',
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Ownership check
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Allowed status transitions for cancellation: pending or accepted
    if (order.orderStatus !== 'pending' && order.orderStatus !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in status '${order.orderStatus}'`,
      });
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = reason || cancelReason || 'Cancelled by buyer';
    order.statusHistory.push({
      status: 'cancelled',
      changedAt: new Date(),
      changedBy: req.user._id,
    });

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantityAvailable: item.quantity },
        status: 'active',
      });
    }

    // Send notification to farmer
    const farmerProfile = await FarmerProfile.findById(order.farmer);
    if (farmerProfile && farmerProfile.user) {
      await createNotification({
        receiver: farmerProfile.user,
        type: 'order_cancelled',
        message: 'An order has been cancelled by the buyer.',
        relatedOrder: order._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling order',
      error: error.message,
    });
  }
};

// Helper function to handle farmer status transitions
const updateOrderStatusByFarmer = async (req, res, targetStatus, allowedFromStatuses, customUpdateFn = null) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Valid order ID is required',
    });
  }

  const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
  if (!farmerProfile) {
    return res.status(404).json({
      success: false,
      message: 'Farmer profile not found for authenticated user',
    });
  }

  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Farmer ownership check
  if (order.farmer.toString() !== farmerProfile._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to modify another farmer\'s order',
    });
  }

  // Allowed current status check
  if (!allowedFromStatuses.includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status transition from '${order.orderStatus}' to '${targetStatus}'`,
    });
  }

  order.orderStatus = targetStatus;
  order.statusHistory.push({
    status: targetStatus,
    changedAt: new Date(),
    changedBy: req.user._id,
  });

  if (customUpdateFn) {
    await customUpdateFn(order);
  }

  await order.save();

  // Send status notifications to buyer
  if (targetStatus === 'accepted') {
    await createNotification({
      receiver: order.buyer,
      type: 'order_accepted',
      message: 'Your order has been accepted.',
      relatedOrder: order._id,
    });
  } else if (targetStatus === 'shipped') {
    await createNotification({
      receiver: order.buyer,
      type: 'order_shipped',
      message: 'Your order has been shipped.',
      relatedOrder: order._id,
    });
  } else if (targetStatus === 'rejected') {
    await createNotification({
      receiver: order.buyer,
      type: 'order_cancelled',
      message: 'Your order was rejected by the farmer.',
      relatedOrder: order._id,
    });
  }

  return res.status(200).json({
    success: true,
    message: `Order status updated to '${targetStatus}'`,
    order,
  });
};

// @desc    Farmer accepts pending order (pending -> accepted)
// @route   PATCH /api/orders/:id/accept
// @access  Private (Farmer)
export const acceptOrder = async (req, res) => {
  try {
    return await updateOrderStatusByFarmer(req, res, 'accepted', ['pending']);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while accepting order',
      error: error.message,
    });
  }
};

// @desc    Farmer rejects pending order (pending -> rejected)
// @route   PATCH /api/orders/:id/reject
// @access  Private (Farmer)
export const rejectOrder = async (req, res) => {
  try {
    const { reason, cancelReason } = req.body;
    return await updateOrderStatusByFarmer(
      req,
      res,
      'rejected',
      ['pending'],
      async (order) => {
        order.cancelReason = reason || cancelReason || 'Rejected by farmer';
        // Restore stock when rejected
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { quantityAvailable: item.quantity },
            status: 'active',
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while rejecting order',
      error: error.message,
    });
  }
};

// @desc    Farmer starts processing order (accepted -> processing)
// @route   PATCH /api/orders/:id/process
// @access  Private (Farmer)
export const processOrder = async (req, res) => {
  try {
    return await updateOrderStatusByFarmer(req, res, 'processing', ['accepted']);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while processing order',
      error: error.message,
    });
  }
};

// @desc    Farmer ships order (processing -> shipped)
// @route   PATCH /api/orders/:id/ship
// @access  Private (Farmer)
export const shipOrder = async (req, res) => {
  try {
    return await updateOrderStatusByFarmer(req, res, 'shipped', ['processing']);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while shipping order',
      error: error.message,
    });
  }
};

// @desc    Mark order delivered (shipped -> delivered)
// @route   PATCH /api/orders/:id/deliver
// @access  Private (Farmer or Admin)
export const deliverOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid order ID is required',
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization: farmer owner or admin
    if (req.user.role === 'farmer') {
      const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
      if (!farmerProfile || order.farmer.toString() !== farmerProfile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to deliver another farmer\'s order',
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark order delivered',
      });
    }

    if (order.orderStatus !== 'shipped') {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${order.orderStatus}' to 'delivered'`,
      });
    }

    order.orderStatus = 'delivered';
    order.statusHistory.push({
      status: 'delivered',
      changedAt: new Date(),
      changedBy: req.user._id,
    });

    await order.save();

    await createNotification({
      receiver: order.buyer,
      type: 'order_delivered',
      message: 'Your order has been delivered.',
      relatedOrder: order._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Order marked as delivered successfully',
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while delivering order',
      error: error.message,
    });
  }
};

// @desc    Generic Order Status Update (PUT /api/orders/:id/status)
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid order ID is required',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'New order status is required',
      });
    }

    if (status === 'cancelled') {
      return await cancelOrder(req, res);
    } else if (status === 'accepted') {
      return await acceptOrder(req, res);
    } else if (status === 'rejected') {
      return await rejectOrder(req, res);
    } else if (status === 'processing') {
      return await processOrder(req, res);
    } else if (status === 'shipped') {
      return await shipOrder(req, res);
    } else if (status === 'delivered') {
      return await deliverOrder(req, res);
    } else {
      return res.status(400).json({
        success: false,
        message: `Unsupported or invalid status '${status}'`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating order status',
      error: error.message,
    });
  }
};
