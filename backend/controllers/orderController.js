const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
  try {
    const { items, shipping_address, total_amount } = req.body;

    // Support both legacy (product_ids) and new (items) format
    const product_ids = items ? items.map(i => i.product_id) : req.body.product_ids;

    if (!product_ids || product_ids.length === 0) {
      return res.status(400).json({ success: false, error: 'No order items' });
    }

    // Ensure items include required fields (title, price). If frontend sent minimal
    // items (only product_id and quantity), fetch product details and enrich.
    let finalItems = [];
    if (items && items.length > 0) {
      // Find products for enrichment
      const products = await Product.find({ _id: { $in: product_ids } }).select('title price images');
      const productsById = {};
      products.forEach(p => { productsById[p._id.toString()] = p; });

      finalItems = items.map(i => {
        const p = productsById[i.product_id];
        return {
          product_id: i.product_id,
          title: p ? p.title : i.title || 'Unknown Product',
          price: p ? p.price : (i.price || 0),
          quantity: i.quantity || 1,
          image: p && p.images && p.images.length ? p.images[0] : (i.image || null),
        };
      });
    } else if (product_ids && product_ids.length > 0) {
      // Legacy path: only product_ids provided, build items with qty=1
      const products = await Product.find({ _id: { $in: product_ids } }).select('title price images');
      finalItems = products.map(p => ({ product_id: p._id, title: p.title, price: p.price, quantity: 1, image: p.images && p.images.length ? p.images[0] : null }));
    }

    const order = new Order({
      user_id: req.user._id,
      product_ids,
      items: finalItems,
      shipping_address: shipping_address || null,
      total_amount,
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    console.error('Error in addOrderItems:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user_id', 'name email')
      .populate('product_ids', 'title price images');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Only allow admin, seller (for their products), or the order owner to view it
    if (
      order.user_id._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'seller'
    ) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .populate('product_ids', 'title price images')
      .sort('-created_at');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user_id', 'id name').sort('-created_at');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get orders that contain the seller's products
// @route   GET /api/orders/seller
// @access  Private/Seller
exports.getSellerOrders = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const orders = await Order.find({})
        .populate('user_id', 'name email')
        .populate('product_ids', 'title price images seller')
        .sort('-created_at');
      return res.status(200).json({ success: true, count: orders.length, data: orders });
    }

    // First, find all products owned by this seller
    const sellerProducts = await Product.find({ seller: req.user._id }).select('_id title');
    const sellerProductIds = sellerProducts.map(p => p._id);

    // Then find orders containing any of those products
    const orders = await Order.find({
      product_ids: { $in: sellerProductIds }
    })
      .populate('user_id', 'name email')
      .populate('product_ids', 'title price images seller')
      .sort('-created_at');

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update order delivery status (Seller/Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Seller/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { delivery_status } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(delivery_status)) {
      return res.status(400).json({ success: false, error: 'Invalid delivery status' });
    }

    const order = await Order.findById(req.params.id).populate('product_ids', 'seller');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Sellers can only update orders that contain their products
    if (req.user.role === 'seller') {
      const isSellerOrder = order.product_ids.some(
        p => p.seller && p.seller.toString() === req.user._id.toString()
      );
      if (!isSellerOrder) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this order' });
      }
    }

    order.delivery_status = delivery_status;
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
