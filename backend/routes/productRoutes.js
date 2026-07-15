const express = require('express');
const multer = require('multer');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'seller'), upload.single('image'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin', 'seller'), upload.single('image'), updateProduct)
  .delete(protect, authorize('admin', 'seller'), deleteProduct);

module.exports = router;
