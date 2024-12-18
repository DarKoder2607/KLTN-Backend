const express = require("express");
const router = express.Router()
const OrderController = require('../controller/OrderController');
const { authUserMiddleware, authMiddleware } = require("../middleware/authMiddleware");

router.post('/create/:id', authUserMiddleware, OrderController.createOrder)
router.get('/get-all-order/:id',authUserMiddleware, OrderController.getAllOrderDetails)
router.get('/get-details-order/:id', OrderController.getDetailsOrder)
router.delete('/cancel-order/:id',authUserMiddleware, OrderController.cancelOrderDetails)
router.get('/get-all-order',authMiddleware, OrderController.getAllOrder)
router.put('/mark-as-delivered/:id', authMiddleware, OrderController.markAsDelivered)
router.put('/mark-as-delivered2/:id', authMiddleware, OrderController.markAsDelivered2) 
router.put('/mark-as-paid/:id', authMiddleware, OrderController.markAsPaid)
router.get('/total-order-price-by-product', OrderController.getTotalOrderPriceByProduct);
router.get('/revenue-by-user', OrderController.getRevenueByUser);

module.exports = router