const Razorpay = require('razorpay');
const Product = require('../models/Product');
const Order = require('../models/Order'); // Import the Order model

// Make sure environment variables are available
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

// Debug log
console.log('Razorpay Key ID:', key_id);

// Initialize Razorpay with error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: key_id,
    key_secret: key_secret
  });
} catch (error) {
  console.error('Razorpay initialization error:', error);
}

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  if (!razorpay) {
    return res.status(500).json({ message: 'Payment gateway not configured properly' });
  }

  try {
    const { productId } = req.body;
    
    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Create Razorpay order
    const options = {
      amount: product.price * 100, // Amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `order_${productId}_${Date.now()}`,
      payment_capture: 1
    };
    
    const razorpayOrder = await razorpay.orders.create(options);

    // Save order details to MongoDB
    const order = new Order({
      razorpayOrderId: razorpayOrder.id,
      productId: product._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      status: razorpayOrder.status
    });

    await order.save();

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      product: {
        id: product._id,
        title: product.title,
        price: product.price
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  // For demo purposes, simply return success
  // In production, you should verify the payment signature
  res.json({ success: true, message: 'Payment verified successfully' });
};

module.exports = { createOrder, verifyPayment };