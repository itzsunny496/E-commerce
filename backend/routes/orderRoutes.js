const express = require('express');
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  getSellerOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, authorize('admin'), getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/seller').get(protect, authorize('seller', 'admin'), getSellerOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, authorize('seller', 'admin'), updateOrderStatus);

module.exports = router;
