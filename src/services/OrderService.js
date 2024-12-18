const Cart = require("../models/CartModel");
const Order = require("../models/OrderProduct")
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const EmailService = require("../services/EmailService")
const moment = require('moment');

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
        phone, user, isPaid, paidAt, email, rewardPointsUsed,ward, district } = newOrder;
    
    try { 
        const cityCodes = {
            'An Giang': 'AG', 'Bà Rịa - Vũng Tàu': 'BV', 'Bạc Liêu': 'BL', 'Bắc Kạn': 'BK',
            'Bắc Giang': 'BG', 'Bắc Ninh': 'BN', 'Bến Tre': 'BT', 'Bình Dương': 'BD',
            'Bình Định': 'BDI', 'Bình Phước': 'BP', 'Bình Thuận': 'BT', 'Cà Mau': 'CM',
            'Cao Bằng': 'CB', 'Cần Thơ': 'CT', 'Đà Nẵng': 'DN', 'Đắk Lắk': 'DL', 'Đắk Nông': 'DNO',
            'Điện Biên': 'DB', 'Đồng Nai': 'DNA', 'Đồng Tháp': 'DT', 'Gia Lai': 'GL', 'Hà Giang': 'HG',
            'Hà Nam': 'HNA', 'Hà Nội': 'HN', 'Hà Tĩnh': 'HT', 'Hải Dương': 'HD', 'Hải Phòng': 'HP',
            'Hậu Giang': 'HGI', 'Hòa Bình': 'HB', 'Hồ Chí Minh': 'SG', 'Hưng Yên': 'HY',
            'Khánh Hòa': 'KH', 'Kiên Giang': 'KG', 'Kon Tum': 'KT', 'Lai Châu': 'LC', 'Lạng Sơn': 'LS',
            'Lào Cai': 'LCA', 'Lâm Đồng': 'LD', 'Long An': 'LA', 'Nam Định': 'ND', 'Nghệ An': 'NA',
            'Ninh Bình': 'NB', 'Ninh Thuận': 'NT', 'Phú Thọ': 'PT', 'Phú Yên': 'PY', 'Quảng Bình': 'QB',
            'Quảng Nam': 'QNA', 'Quảng Ngãi': 'QNG', 'Quảng Ninh': 'QN', 'Quảng Trị': 'QT',
            'Sóc Trăng': 'ST', 'Sơn La': 'SL', 'Tây Ninh': 'TN', 'Thái Bình': 'TB', 'Thái Nguyên': 'TNG',
            'Thanh Hóa': 'TH', 'Thừa Thiên Huế': 'TTH', 'Tiền Giang': 'TG', 'Trà Vinh': 'TV',
            'Tuyên Quang': 'TQ', 'Vĩnh Long': 'VL', 'Vĩnh Phúc': 'VP', 'Yên Bái': 'YB'
        };

        const cityCode = cityCodes[city] || 'ORD'; 
        const today = new Date();
        const dateCode = today.toISOString().slice(0, 10).replace(/-/g, '');  
        const countOrdersToday = await Order.countDocuments({ createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) } }); 
        const orderCode = `${cityCode}-${dateCode}-${String(countOrdersToday + 1).padStart(4, '0')}`;


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
 
        const createdOrder = await Order.create({
            orderItems,
            shippingAddress: { fullName, address, city, phone, ward, district },
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            user: user,
            isPaid, 
            paidAt,
            rewardPointsUsed: rewardPointsUsed || 0,
            rewardPointsEarned,
            orderCode
        });

       
        const notification = { 
            title: isPaid ? 'Thanh toán thành công' : 'Đặt hàng thành công', 
            content: isPaid 
                ? `Đơn hàng ${orderCode} của bạn đã được thanh toán thành công. Tổng giá trị: ${totalPrice.toLocaleString()} VND.` 
                : `Đơn hàng ${orderCode} của bạn đã được đặt thành công. Tổng giá trị: ${totalPrice.toLocaleString()} VND. Vui lòng thanh toán khi nhận hàng` 
        };

        await User.findByIdAndUpdate(user, { 
            $push: { notifications: notification } 
        });   

        if (isPaid === true) {
            await User.findByIdAndUpdate(user, {
                $inc: {
                    rewardPoints: rewardPointsEarned - (rewardPointsUsed || 0)
                },
                $push: { 
                    notifications: { 
                        title: 'Điểm thưởng đã được cộng', 
                        content: `Bạn đã nhận được ${rewardPointsEarned.toLocaleString()} điểm thưởng từ đơn hàng ${orderCode}.` 
                    } 
                }

            });
        }  
 
        if (createdOrder) {
            await EmailService.sendEmailCreateOrder(email, createdOrder);
        }
 
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
            const promises = data.map(async (orderdata) => {
                const productData = await Product.findOneAndUpdate(
                    {
                    _id: orderdata.product,
                    selled: {$gte: orderdata.amount}
                    },
                    {$inc: {
                        countInStock: +orderdata.amount,
                        selled: -orderdata.amount
                    }},
                    {new: true}
                )
                if(productData) {
                    order = await Order.findByIdAndDelete(id)
                    if (order === null) {
                        resolve({
                            status: 'ERR',
                            message: 'The order is not defined'
                        });
                    } else {
                        const userId = order.user; 

                        if (userId) {
                            
                            if(!order.isPaid){
                                const notification = {
                                    title: 'Hủy đơn hàng thành công',
                                    content: `Đơn hàng mã ${order._id} đã bị hủy thành công. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.`,
                                };
                                await User.findByIdAndUpdate(
                                    userId,
                                    { $push: { notifications: notification } }, 
                                    { new: true }
                                );
                            }else{
                                const user = await User.findById(userId);
                              if(user.rewardPoints >= Math.floor(order.totalPrice/1000)){
                                const reward = user.rewardPoints -Math.floor(order.totalPrice/1000);
                                const notification = {
                                    title: 'Hủy đơn hàng thành công', 
                                    content: `Đơn hàng mã ${order.orderCode} đã bị hủy thành công. Chúng tôi sẽ hoàn trả số tiền ${order.totalPrice.toLocaleString()} VNĐ trong thời gian nhanh nhất.`, 
                                };
                                await User.findByIdAndUpdate(
                                    userId,
                                    { $push: { notifications: notification } }, 
                                    { new: true }
                                );
                            
                                user.rewardPoints -= order.totalPrice/1000;
                                user.notifications.push({
                                    title: 'Trừ điểm thưởng thành công',
                                    content: `${Math.floor(order.totalPrice/1000).toLocaleString()} điểm đã được trừ vào tài khoản của bạn`
                                });
                                await user.save();
                              }else{
                                const swap = Math.floor(order.totalPrice/1000) - user.rewardPoints; 
                                const totalMonney = order.totalPrice - swap*1000;
                                user.notifications.push({
                                    title: 'Không đủ điểm thưởng',
                                    content: `Điểm của bạn hiện tại không đủ để xóa đơn hàng. Chúng tôi quy đổi 1000 điểm thưởng = 1000VND. Bạn thiếu ${swap} điểm = ${swap*1000} VNĐ`
                                });
                                user.rewardPoints = 0;
                                const notification = {
                                    title: 'Hủy đơn hàng thành công', 
                                    content: `Đơn hàng mã ${order.orderCode} đã bị hủy thành công. Chúng tôi sẽ hoàn trả số tiền ${totalMonney.toLocaleString()} VNĐ trong thời gian nhanh nhất.`, 
                                };
                                await User.findByIdAndUpdate(
                                    userId,
                                    { $push: { notifications: notification } }, 
                                    { new: true }
                                );
                                await user.save();
                              }       
                            }
                        }
                        
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
                    message: `Sản phẩm với ID: ${newData} không tồn tại`
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
                    user.notifications.push({
                        title: 'Điểm thưởng đã được cộng',
                        content: `Bạn đã thanh toán thành công đơn hàng. Bạn đã nhận được ${order.rewardPointsEarned} điểm thưởng từ đơn hàng ${order.orderCode} của mình.`
                    });
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

const getRevenueByUser = async ({ year, month, quarter }) => {
    try {
        let matchConditions = { isPaid: true };

        if (year) {
            matchConditions.paidAt = { $gte: moment().year(year).startOf('year').toDate(), $lte: moment().year(year).endOf('year').toDate() };
        }

        if (month) {
            matchConditions.paidAt = { $gte: moment().month(month - 1).startOf('month').toDate(), $lte: moment().month(month - 1).endOf('month').toDate() };
        }

        if (quarter) {
            const startMonth = (quarter - 1) * 3;
            matchConditions.paidAt = { $gte: moment().month(startMonth).startOf('month').toDate(), $lte: moment().month(startMonth + 2).endOf('month').toDate() };
        }

        const orders = await Order.aggregate([
            { $match: matchConditions },
            { $group: {
                _id: "$user", 
                totalRevenue: { $sum: "$totalPrice" },
            }},
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }},
            { $unwind: "$userDetails" },
            { $project: {
                userName: "$userDetails.name",
                userEmail: "$userDetails.email",
                totalRevenue: 1
            }}
        ]);

        return orders;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    createOrder,
    getAllOrderDetails,
    getOrderDetails,
    cancelOrderDetails,
    getAllOrder,
    updateOrderStatus,
    getTotalOrderPriceByProduct,
    getRevenueByUser
}