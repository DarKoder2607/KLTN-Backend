const Cart = require("../models/CartModel");
const Order = require("../models/OrderProduct")
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const EmailService = require("../services/EmailService")

// const createOrder = (newOrder) => {
//     return new Promise(async (resolve, reject) => {
//         const { orderItems,paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone,user, isPaid, paidAt,email } = newOrder
//         try {
//             const promises = orderItems.map(async (order) => {
//                 const productData = await Product.findOneAndUpdate(
//                     {
//                     _id: order.product,
//                     countInStock: {$gte: order.amount}
//                     },
//                     {$inc: {
//                         countInStock: -order.amount,
//                         selled: +order.amount
//                     }},
//                     {new: true}
//                 )
//                 if(productData) {
//                     return {
//                         status: 'OK',
//                         message: 'SUCCESS'
//                     }
//                 }
//                  else {
//                     return{
//                         status: 'OK',
//                         message: 'ERR',
//                         id: order.product
//                     }
//                 }
//             })
//             const results = await Promise.all(promises)
//             const newData = results && results.filter((item) => item.id)
//             if(newData.length) {
//                 const arrId = []
//                 newData.forEach((item) => {
//                     arrId.push(item.id)
//                 })
//                 resolve({
//                     status: 'ERR',
//                     message: `San pham voi id: ${arrId.join(',')} khong du hang`
//                 })
//             } else {
//                 const createdOrder = await Order.create({
//                     orderItems,
//                     shippingAddress: {
//                         fullName,
//                         address,
//                         city, phone
//                     },
//                     paymentMethod,
//                     itemsPrice,
//                     shippingPrice,
//                     totalPrice,
//                     user: user,
//                     isPaid, paidAt
//                 })
//                 if (createdOrder) {
//                     await EmailService.sendEmailCreateOrder(email,orderItems)
//                     resolve({
//                         status: 'OK',
//                         message: 'success'
//                     })
//                 }
//             }
//             console.log('results', results)
//         } catch (e) {
//           console.log('e', e)
//             reject(e)
//         }
//     })
    
// }

const createOrder = async (newOrder) => {
    const { orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, 
        phone, user, isPaid, paidAt, email, rewardPointsUsed } = newOrder;
    
    try {
        // 1. Kiểm tra và cập nhật số lượng sản phẩm
        const promises = orderItems.map(async (order) => {
            const productData = await Product.findOneAndUpdate(
                { _id: order.product, countInStock: { $gte: order.amount } },
                { $inc: { countInStock: -order.amount, selled: +order.amount } },
                { new: true }
            );
            if (!productData) {
                throw new Error(`Product with id ${order.product} is not available in the required quantity`);
            }
        });

        await Promise.all(promises);

        const rewardPointsEarned = Math.floor(totalPrice / 1000); 
        
        if (rewardPointsUsed > 0) {
            const discountFromPoints = rewardPointsUsed * 3; // 1 điểm = 3 VND
            if (totalPrice < discountFromPoints) throw new Error('Số điểm sử dụng vượt quá giá trị đơn hàng');
        }

        // 2. Tạo đơn hàng
        const createdOrder = await Order.create({
            orderItems,
            shippingAddress: { fullName, address, city, phone },
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            user: user,
            isPaid, 
            paidAt,
            rewardPointsUsed: rewardPointsUsed || 0,
            rewardPointsEarned,
        });

       

            

        if (isPaid === true) {
            await User.findByIdAndUpdate(user, {
                $inc: {
                    rewardPoints: rewardPointsEarned - (rewardPointsUsed || 0)
                }
            });
        }  

        // 3. Gửi email xác nhận đơn hàng
        if (createdOrder) {
            await EmailService.sendEmailCreateOrder(email, orderItems);
        }

        // 4. Xóa các sản phẩm đã đặt mua khỏi giỏ hàng của người dùng
        const cart = await Cart.findOne({ user });
        if (cart) {
            cart.cartItems = cart.cartItems.filter(cartItem => 
                !orderItems.some(orderItem => orderItem.product._id.toString() === cartItem.product.toString())
            );
            await cart.save();
        }

        return {
            status: 'OK',
            message: 'Order created successfully',
            data: createdOrder
        };

    } catch (error) {
        throw new Error(error.message);
    }
};

// const deleteManyProduct = (ids) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             await Product.deleteMany({ _id: ids })
//             resolve({
//                 status: 'OK',
//                 message: 'Delete product success',
//             })
//         } catch (e) {
//             reject(e)
//         }
//     })
// }

const getAllOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.find({
                user: id
            }).sort({createdAt: -1, updatedAt: -1})
            if (order === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCESSS',
                data: order
            })
        } catch (e) {
            // console.log('e', e)
            reject(e)
        }
    })
}

const getOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findById({
                _id: id
            })
            if (order === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCESSS',
                data: order
            })
        } catch (e) {
            // console.log('e', e)
            reject(e)
        }
    })
}

const cancelOrderDetails = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order = []
            const promises = data.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                    _id: order.product,
                    selled: {$gte: order.amount}
                    },
                    {$inc: {
                        countInStock: +order.amount,
                        selled: -order.amount
                    }},
                    {new: true}
                )
                if(productData) {
                    order = await Order.findByIdAndDelete(id)
                    if (order === null) {
                        resolve({
                            status: 'ERR',
                            message: 'The order is not defined'
                        })
                    }
                } else {
                    return{
                        status: 'OK',
                        message: 'ERR',
                        id: order.product
                    }
                }
            })
            const results = await Promise.all(promises)
            const newData = results && results[0] && results[0].id
            
            if(newData) {
                resolve({
                    status: 'ERR',
                    message: `San pham voi id: ${newData} khong ton tai`
                })
            }
            resolve({
                status: 'OK',
                message: 'success',
                data: order
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllOrder = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allOrder = await Order.find().sort({createdAt: -1, updatedAt: -1})
            resolve({
                status: 'OK',
                message: 'Success',
                data: allOrder
            })
        } catch (e) {
            reject(e)
        }
    })
}

const updateOrderStatus = (orderId, updateFields) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findById(orderId);
            
            if (!order) {
                resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                });
            }

            if (!order.isPaid && updateFields.isPaid === true) {
                const user = await User.findById(order.user);
                if (user) {
                    user.rewardPoints -= order.rewardPointsUsed;
                    user.rewardPoints += order.rewardPointsEarned; 
                    await user.save();
                }
            }
            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                { $set: updateFields },
                { new: true }
            );

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedOrder
            });
        } catch (e) {
            reject(e);
        }
    });
};


const getTotalOrderPriceByProduct = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm tất cả các đơn hàng
            const orders = await Order.find();
            let productPriceSummary = {};

            // Lặp qua tất cả các đơn hàng và tính toán tổng giá theo sản phẩm
            orders.forEach((order) => {
                order.orderItems.forEach((item) => {
                    const productName = item.name;
                    const itemTotalPrice = item.amount * item.price; // Tính giá trị của sản phẩm trong đơn hàng
                    const isDelivered = order.isDelivered ? 'Đã giao hàng' : 'Chưa giao hàng';
                    const isPaid = order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';

                    // Cộng dồn tổng giá và số lượng theo tên sản phẩm
                    if (productPriceSummary[productName]) {
                        productPriceSummary[productName].totalPrice += itemTotalPrice;
                        productPriceSummary[productName].quantity += item.amount; // Cộng dồn số lượng
                        // Cộng dồn số lượng đã giao và chưa giao
                        if (isDelivered === 'Đã giao hàng') {
                            productPriceSummary[productName].deliveredQuantity += item.amount;
                        } else {
                            productPriceSummary[productName].undeliveredQuantity += item.amount;
                        }
                        // Cộng dồn số lượng đã thanh toán và chưa thanh toán
                        if (isPaid === 'Đã thanh toán') {
                            productPriceSummary[productName].paidQuantity += item.amount;
                        } else {
                            productPriceSummary[productName].unpaidQuantity += item.amount;
                        }
                    } else {
                        productPriceSummary[productName] = {
                            totalPrice: itemTotalPrice,
                            quantity: item.amount,
                            deliveredQuantity: isDelivered === 'Đã giao hàng' ? item.amount : 0,
                            undeliveredQuantity: isDelivered === 'Chưa giao hàng' ? item.amount : 0,
                            paidQuantity: isPaid === 'Đã thanh toán' ? item.amount : 0,
                            unpaidQuantity: isPaid === 'Chưa thanh toán' ? item.amount : 0,
                        };
                    }
                });
            });

            // Chuyển đổi kết quả thành mảng để dễ dàng xử lý trong frontend
            const result = Object.keys(productPriceSummary).map((name) => {
                return {
                    productName: name,
                    totalPrice: productPriceSummary[name].totalPrice,
                    quantity: productPriceSummary[name].quantity,
                    deliveredQuantity: productPriceSummary[name].deliveredQuantity,
                    undeliveredQuantity: productPriceSummary[name].undeliveredQuantity,
                    paidQuantity: productPriceSummary[name].paidQuantity,
                    unpaidQuantity: productPriceSummary[name].unpaidQuantity,
                };
            });

            resolve({
                status: 'OK',
                message: 'Thống kê thành công',
                data: result,
            });
        } catch (e) {
            reject(e);
        }
    });
};




module.exports = {
    createOrder,
    getAllOrderDetails,
    getOrderDetails,
    cancelOrderDetails,
    getAllOrder,
    updateOrderStatus,
    getTotalOrderPriceByProduct
}