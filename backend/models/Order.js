const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  image: { type: String }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Legacy flat array kept for backwards compat
  product_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  // Enhanced items array
  items: [orderItemSchema],
  shipping_address: shippingAddressSchema,
  total_amount: { type: Number, required: true },
  payment_status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  delivery_status: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Order', orderSchema);
