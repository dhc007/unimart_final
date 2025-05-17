const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, department, year } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    department,
    year,
    avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      year: user.year,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
    // Find user
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      year: user.year,
      avatar: user.avatar,
      location: user.location,
      joinedDate: user.joinedDate,
      rating: user.rating,
      totalSales: user.totalSales,
      totalPurchases: user.totalPurchases,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    // Get the token from the request header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401);
      throw new Error('No token provided');
    }

    // Clear the user data from the request
    req.user = null;

    res.clearCookie('token'); // Replace 'token' with your cookie name if applicable


    // Send success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error during logout'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Update user fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.department) user.department = req.body.department;
    if (req.body.year) user.year = req.body.year;
    if (req.body.location) user.location = req.body.location;
    
    // Update avatar if provided
    if (req.body.avatar) {
      // If it's a data URL, keep it as is
      if (req.body.avatar.startsWith('data:')) {
        user.avatar = req.body.avatar;
      } else {
        // If it's a URL, validate it
        try {
          new URL(req.body.avatar);
          user.avatar = req.body.avatar;
        } catch (error) {
          // If not a valid URL, generate a new avatar
          user.avatar = `https://i.pravatar.cc/150?u=${user.name.replace(/\s+/g, '')}`;
        }
      }
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Check if profile is complete
    user.isProfileComplete = Boolean(
      user.name &&
      user.department &&
      user.year &&
      user.location &&
      user.avatar
    );

    // Save changes to database
    const updatedUser = await user.save();

    if (!updatedUser) {
      throw new Error('Failed to update user profile');
    }

    // Generate new token
    const token = generateToken(updatedUser._id);

    res.status(200).json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      department: updatedUser.department,
      year: updatedUser.year,
      avatar: updatedUser.avatar,
      location: updatedUser.location,
      isProfileComplete: updatedUser.isProfileComplete,
      token: token
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

module.exports = { registerUser, authUser, getUserProfile, logoutUser, updateUserProfile };