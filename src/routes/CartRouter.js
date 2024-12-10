const express = require('express');
const { authCartMiddleware } = require('../middleware/authMiddleware');  
const CartController = require('../controller/CartController');
const router = express.Router();

router.post('/add',authCartMiddleware, CartController.addToCartController);
router.delete('/remove/:productId', authCartMiddleware, CartController.removeFromCartController);
router.get('/', authCartMiddleware, CartController.getCartController);
router.put('/update-quantity', authCartMiddleware, CartController.updateCartItemQuantityController);
router.delete('/clear', authCartMiddleware, CartController.clearCartController);

module.exports = router;
