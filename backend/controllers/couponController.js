const Coupon = require('../models/Coupon');

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Validate a coupon
// @route   GET /api/coupons/validate/:code
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code });
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }
    if (new Date(coupon.expiry) < new Date()) {
      return res.status(400).json({ success: false, error: 'Coupon is expired' });
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
