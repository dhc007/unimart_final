const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [String],
    category: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    isBlockchainVerified: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: 'Campus',
    },
  },
  { timestamps: true }
);

// Virtual for getting posted date in relative time format
productSchema.virtual('postedDate').get(function() {
  const now = new Date();
  const postedTime = this.createdAt;
  const diffTime = Math.abs(now - postedTime);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return 'Just now';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
  return `${Math.floor(diffDays/30)} months ago`;
});

// Set toJSON to include virtuals
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;