import Notification from '../models/Notification.js';

/**
 * Reusable helper to create in-app notifications
 * @param {Object} param0 Notification details
 * @returns {Promise<Object|null>} Created notification document or null
 */
export const createNotification = async ({
  receiver,
  type,
  message,
  relatedOrder = null,
  relatedProduct = null,
}) => {
  try {
    if (!receiver || !type || !message) {
      return null;
    }

    const notification = await Notification.create({
      receiver,
      type,
      message,
      relatedOrder,
      relatedProduct,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

/**
 * Helper to check and create a low-stock notification for a product if applicable,
 * avoiding duplicate unread low-stock notifications for the same product.
 * @param {Object} product Product document or object with _id, name, farmer, quantityAvailable
 * @param {Object} farmerProfile FarmerProfile document with user ObjectId
 * @param {Number} threshold Low stock threshold
 */
export const checkAndNotifyLowStock = async (product, farmerProfile, threshold = 5) => {
  try {
    if (!product || product.quantityAvailable > threshold || !farmerProfile || !farmerProfile.user) {
      return;
    }

    const receiverId = farmerProfile.user._id || farmerProfile.user;

    // Check if an unread low_stock notification already exists for this product
    const existingUnread = await Notification.findOne({
      receiver: receiverId,
      type: 'product_low_stock',
      relatedProduct: product._id,
      isRead: false,
    });

    if (!existingUnread) {
      await createNotification({
        receiver: receiverId,
        type: 'product_low_stock',
        message: `Product '${product.name}' is low on stock (${product.quantityAvailable} remaining).`,
        relatedProduct: product._id,
      });
    }
  } catch (error) {
    console.error('Error handling low stock notification:', error.message);
  }
};
