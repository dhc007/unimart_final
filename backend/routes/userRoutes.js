const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  authUser, 
  getUserProfile,
  updateUserProfile 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const connectDB = require('../config/db');
const { logoutUser } = require('../controllers/userController');


router.post('/', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;