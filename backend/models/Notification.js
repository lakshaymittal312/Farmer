import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver reference is required'],
    },
    type: {
      type: String,
      enum: {
        values: [
          'order_placed',
          'order_accepted',
          'order_shipped',
          'order_delivered',
          'order_cancelled',
          'product_low_stock',
          'verification_update',
        ],
        message: '{VALUE} is not a valid notification type',
      },
      required: [true, 'Notification type is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

notificationSchema.index({ receiver: 1, createdAt: -1 });
notificationSchema.index({ receiver: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
