const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  authUser, 
  getUserProfile,
  logoutUser,
  updateUserProfile 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;