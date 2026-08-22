import mongoose from 'mongoose';

const deliveryAddressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Address label is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const buyerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    deliveryAddresses: {
      type: [deliveryAddressSchema],
      default: [],
    },
    preferredCategories: {
      type: [String],
      default: [],
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    totalOrders: {
      type: Number,
      default: 0,
      min: [0, 'Total orders cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

const BuyerProfile = mongoose.model('BuyerProfile', buyerProfileSchema, 'buyerprofiles');

export default BuyerProfile;
