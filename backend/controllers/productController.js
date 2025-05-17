const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png)'));
    }
  },
});

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const filters = {};
  const keyword = req.query.search 
    ? { title: { $regex: req.query.search, $options: 'i' } } 
    : {};
    
  if (req.query.category && req.query.category !== 'All Categories') {
    filters.category = req.query.category;
  }
  if (req.query.subject && req.query.subject !== 'All Subjects') {
    filters.subject = req.query.subject;
  }
  if (req.query.condition && req.query.condition !== 'All Conditions') {
    filters.condition = req.query.condition;
  }
  if (req.query.minPrice && req.query.maxPrice) {
    filters.price = { 
      $gte: Number(req.query.minPrice), 
      $lte: Number(req.query.maxPrice) 
    };
  }
  if (req.query.blockchainVerified === 'true') {
    filters.isBlockchainVerified = true;
  }

  const queryFilter = { ...keyword, ...filters };
  
  let sortOption = {};
  switch (req.query.sort) {
    case 'price-low-high':
      sortOption = { price: 1 };
      break;
    case 'price-high-low':
      sortOption = { price: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
  }

  const products = await Product.find(queryFilter)
    .sort(sortOption)
    .populate('seller', 'name rating');

  res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name rating totalSales avatar department year');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  const {
    title,
    description,
    price,
    category,
    condition,
    subject,
    isBlockchainVerified,
    location,
  } = req.body;

  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const product = new Product({
    title,
    description,
    price: Number(price),
    image,
    category,
    condition,
    subject,
    seller: req.user._id,
    sellerName: req.user.name,
    isBlockchainVerified: isBlockchainVerified || false,
    location: location || 'Campus',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Get products by seller
// @route   GET /api/products/seller
// @access  Private
const getSellerProducts = async (req, res) => {
  const products = await Product.find({ seller: req.user._id })
    .sort({ createdAt: -1 });
  
  res.json(products);
};

module.exports = { 
  getProducts, 
  getProductById, 
  createProduct: [upload.single('image'), createProduct], // Add multer middleware
  getSellerProducts
};