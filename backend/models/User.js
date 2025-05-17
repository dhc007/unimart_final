const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      default: function() {
        // Generate a username based on name or random string
        return 'user_' + Math.random().toString(36).substring(2, 10);
      }
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      immutable: true, // Makes email field immutable
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
    },
    avatar: {
      type: String,
      required: [true, 'Profile image is required'],
      default: function() {
        return `https://i.pravatar.cc/150?u=${this.name?.replace(/\s+/g, '') || 'user'}`;
      }
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      default: 'Campus',
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    isProfileComplete: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;