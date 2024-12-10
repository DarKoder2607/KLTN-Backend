const OrderService = require('../services/OrderService')

const createOrder = async (req, res) => {
    try { 
        const { paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone, rewardPointsUsed } = req.body
        if (!paymentMethod || !itemsPrice || !shippingPrice || !totalPrice || !fullName || !address || !city || !phone) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        }
        const response = await OrderService.createOrder({ 
            ...req.body, 
            rewardPointsUsed 
        } )
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

// const createOrder = async (req, res) => {
//     try {
//         const { paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone, orderItems } = req.body;
        
//         if ( !itemsPrice || !totalPrice || !fullName || !address || !city || !phone || !orderItems.length) {
//             return res.status(400).json({
//                 status: 'ERR',
//                 message: 'All required fields must be provided'
//             });
//         }
        
//         const newOrder = {
//             orderItems,
//             paymentMethod,
//             itemsPrice,
//             shippingPrice,
//             totalPrice,
//             fullName,
//             address,
//             city,
//             phone,
//             user: req.user.id,
//             email: req.user.email, // Giả định rằng email của user có sẵn trong req.user
//         };

//         const response = await OrderService.createOrder(newOrder);
//         return res.status(200).json(response);
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// };

const getAllOrderDetails = async (req, res) => {
    try {
        const userId = req.params.id
        if (!userId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await OrderService.getAllOrderDetails(userId)
        return res.status(200).json(response)
    } catch (e) {
        // console.log(e)
        return res.status(404).json({
            message: e
        })
    }
}

const getDetailsOrder = async (req, res) => {
    try {
        const orderId = req.params.id
        if (!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await OrderService.getOrderDetails(orderId)
        return res.status(200).json(response)
    } catch (e) {
        // console.log(e)
        return res.status(404).json({
            message: e
        })
    }
}

const cancelOrderDetails = async (req, res) => {
    try {
        const data= req.body.orderItems
        const orderId= req.body.orderId
        if (!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The orderId is required'
            })
        }
        const response = await OrderService.cancelOrderDetails(orderId, data)
        return res.status(200).json(response)
    } catch (e) {
        // console.log(e)
        return res.status(404).json({
            message: e
        })
    }
}

const getAllOrder = async (req, res) => {
    try {
        const data = await OrderService.getAllOrder()
        return res.status(200).json(data)
    } catch (e) {
        // console.log(e)
        return res.status(404).json({
            message: e
        })
    }
}

const markAsDelivered = async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!orderId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'The orderId is required'
            });
        }
        const response = await OrderService.updateOrderStatus(orderId, { isDelivered: true, deliveredAt: new Date() });
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({ message: e });
    }
}

const markAsPaid = async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!orderId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'The orderId is required'
            });
        }
        const response = await OrderService.updateOrderStatus(orderId, { isPaid: true, paidAt: new Date() });
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({ message: e });
    }
}

const getTotalOrderPriceByProduct = async (req, res) => {
    try {
        const response = await OrderService.getTotalOrderPriceByProduct();
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

module.exports = {
    createOrder,
    getAllOrderDetails,
    getDetailsOrder,
    cancelOrderDetails,
    getAllOrder,
    markAsDelivered,
    markAsPaid,
    getTotalOrderPriceByProduct 
}
