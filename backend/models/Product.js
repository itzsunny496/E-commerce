const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true, index: true },
  images: [{ type: String }],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Setting to false initially to not break existing products
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Index for price queries
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
