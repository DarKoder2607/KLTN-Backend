const express = require("express");
const router = express.Router()
const OrderController = require('../controller/OrderController');
const { authUserMiddleware, authMiddleware } = require("../middleware/authMiddleware");

router.post('/create/:id', OrderController.createOrder)
router.get('/get-all-order/:id', OrderController.getAllOrderDetails)
router.get('/get-details-order/:id', OrderController.getDetailsOrder)
router.delete('/cancel-order/:id', OrderController.cancelOrderDetails)
router.get('/get-all-order', OrderController.getAllOrder)
router.put('/mark-as-delivered/:id',  OrderController.markAsDelivered)
router.put('/mark-as-paid/:id', OrderController.markAsPaid)


module.exports = router