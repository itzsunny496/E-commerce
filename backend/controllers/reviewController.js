const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const review = await Review.create({
      product_id,
      user_id: req.user._id,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId }).populate('user_id', 'name');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all reviews for the logged-in seller's products
// @route   GET /api/reviews/seller
// @access  Private/Seller
exports.getSellerReviews = async (req, res) => {
  try {
    // Find all product IDs owned by this seller
    const sellerProducts = await Product.find({ seller: req.user._id }).select('_id title');
    const sellerProductIds = sellerProducts.map(p => p._id);

    const reviews = await Review.find({ product_id: { $in: sellerProductIds } })
      .populate('user_id', 'name')
      .populate('product_id', 'title images')
      .sort('-created_at');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
