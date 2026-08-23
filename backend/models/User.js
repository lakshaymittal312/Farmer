import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['farmer', 'buyer', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'buyer',
      required: true,
    },
    permissions: {
      type: [String],
      default: function () {
        if (this.role === 'admin') {
          return ['manage_users', 'manage_products', 'manage_orders'];
        }
        return [];
      },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    profileImage: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    pincode: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure admin role gets default permissions if permissions array is empty
userSchema.pre('save', function (next) {
  if (this.role === 'admin' && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = ['manage_users', 'manage_products', 'manage_orders'];
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
