const express = require('express');
const { createCoupon, validateCoupon } = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, authorize('admin'), createCoupon);
router.route('/validate/:code').get(validateCoupon);

module.exports = router;
