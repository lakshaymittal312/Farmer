import mongoose from 'mongoose';

const bankDetailsSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      trim: true,
      default: '',
    },
    ifsc: {
      type: String,
      trim: true,
      default: '',
    },
    upiId: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
    },
    farmDescription: {
      type: String,
      trim: true,
      default: '',
    },
    village: {
      type: String,
      required: [true, 'Village is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
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
    farmingType: {
      type: String,
      enum: {
        values: ['organic', 'conventional', 'mixed'],
        message: '{VALUE} is not a valid farming type',
      },
      default: 'conventional',
    },
    cropsGrown: {
      type: [String],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected'],
        message: '{VALUE} is not a valid verification status',
      },
      default: 'pending',
      required: true,
    },
    verificationDocs: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: [0, 'Total orders cannot be negative'],
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: [0, 'Total revenue cannot be negative'],
    },
    bankDetails: {
      type: bankDetailsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const FarmerProfile = mongoose.model('FarmerProfile', farmerProfileSchema, 'farmerprofiles');

export default FarmerProfile;
