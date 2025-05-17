const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct,
  getSellerProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getProducts)
  .post(protect, createProduct);

router.get('/seller', protect, getSellerProducts);
router.get('/:id', getProductById);

module.exports = router;