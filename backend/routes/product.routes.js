const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const productController = require('../controllers/product.controller');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// PUBLIC ROUTES
router.get('/', productController.getAllProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProduct);

// PROTECTED ROUTES (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.put('/reorder', productController.updateProductsOrder);

router.put('/:id/toggle-featured', productController.toggleFeatured);

router.post('/', upload.uploadProductMedia, productController.createProduct);
router.route('/:id')
  .put(upload.uploadProductMedia, productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
