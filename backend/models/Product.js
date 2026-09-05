import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
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
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: {
        values: ['kg', 'quintal', 'dozen', 'piece', 'litre'],
        message: '{VALUE} is not a valid unit',
      },
    },
    quantityAvailable: {
      type: Number,
      required: [true, 'Quantity available is required'],
      min: [0, 'Quantity available cannot be negative'],
    },
    images: {
      type: [String],
      required: [true, 'Images are required'],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length >= 1;
        },
        message: 'At least one image URL is required',
      },
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: [true, 'Farmer reference is required'],
    },
    location: {
      type: locationSchema,
      required: [true, 'Location is required'],
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    harvestDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'out_of_stock'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be greater than 5'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure status consistency based on quantityAvailable
productSchema.pre('save', function (next) {
  if (this.quantityAvailable === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  } else if (this.quantityAvailable > 0 && this.status === 'out_of_stock') {
    this.status = 'active';
  }
  next();
});

// Indexes for performant querying
productSchema.index({ farmer: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
