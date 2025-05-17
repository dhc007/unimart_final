const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products');
  
  if (!wishlist) {
    // Create empty wishlist if none exists
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: []
    });
    wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products');
  }
  
  res.json(wishlist.products);
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Find user's wishlist or create one
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: []
    });
  }

  // Check if product is already in wishlist
  if (wishlist.products.includes(productId)) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  // Add to wishlist
  wishlist.products.push(productId);
  await wishlist.save();
  
  // Return updated wishlist
  const updatedWishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products');
  
  res.status(201).json(updatedWishlist.products);
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
  const productId = req.params.id;
  
  // Find user's wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }
  
  // Remove product
  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );
  
  await wishlist.save();
  
  // Return updated wishlist
  const updatedWishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products');
  
  res.json(updatedWishlist.products);
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
  // Find user's wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }
  
  // Clear products
  wishlist.products = [];
  await wishlist.save();
  
  res.json({ message: 'Wishlist cleared' });
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, clearWishlist };