const express = require("express");
const router = express.Router()
const ProductController = require('../controller/ProductController');
const { authMiddleware, authUserMiddleware, authUserRMiddleware, authRMiddleware } = require("../middleware/authMiddleware");

router.post('/create', ProductController.createProduct)
router.put('/update/:id', authMiddleware, ProductController.updateProduct)
router.get('/details/:id', ProductController.getDetailsProduct)
router.delete('/delete/:id', authMiddleware, ProductController.deleteProduct)
router.get('/getAll', ProductController.getAllProduct);
router.get('/getAllByDeviceType', ProductController.getProductsByDeviceType);
router.post('/delete-many', authMiddleware, ProductController.deleteMany)
router.get('/get-all-type', ProductController.getAllType)
router.get('/get-all-device-type', ProductController.getAllDeviceType)
router.get('/filter', ProductController.filterProducts);
router.get('/top-selling', ProductController.getTopSellingProducts);
router.get('/recommend/:id', ProductController.getRecommendProduct)
router.put('/toggleVisibility/:id', authMiddleware, ProductController.toggleProductVisibility);

//review Product
router.post('/details/review/:id', authUserRMiddleware, ProductController.addProductReview);
router.get('/details/reviews/:id', ProductController.getProductReviews);
// Ẩn bình luận
router.put('/details/review/hide/:productId/:reviewId', authRMiddleware, ProductController.hideProductReview);
router.put('/details/review/unhide/:productId/:reviewId', authRMiddleware, ProductController.unhideProductReview);

router.get('/brands', ProductController.getAllBrands);

module.exports = router
