const express = require('express');
const { addReview, getReviews, getSellerReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, addReview);
router.route('/seller').get(protect, authorize('seller', 'admin'), getSellerReviews);
router.route('/:productId').get(getReviews);

module.exports = router;
