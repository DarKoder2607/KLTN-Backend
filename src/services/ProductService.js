const Product = require("../models/ProductModel")
const Order = require ("../models/OrderProduct")
const mongoose = require('mongoose');
const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const {
          name,
          image,
          type,
          countInStock,
          price,
          rating,
          discount,
          relatedImages,
          deviceType,
          phoneSpecs,
          watchSpecs,
          laptopSpecs,
          tabletSpecs,
          audioSpecs,
          loudspeakerSpecs,
        } = newProduct;
        try{
            const checkProduct = await Product.findOne({
                name: name
            })
            if(checkProduct !== null){
                resolve({
                    status: 'OK',
                    message: 'The name of product is already in use'
                })
            }
            
            let specs;
            switch (deviceType) {
              case "phone":
                specs = { phoneSpecs };
                break;
              case "watch":
                specs = { watchSpecs };
                break;
              case "laptop":
                specs = { laptopSpecs };
                break;
              case "tablet":
                specs = { tabletSpecs };
                break;
              case "audio":
                specs = { audioSpecs };
                break;
              case "loudspeaker":
                specs = { loudspeakerSpecs };
                break;
              default:
                return resolve({
                  status: "ERR",
                  message: "Invalid device type",
                });
            }
            const createdProduct = await Product.create({
                name,
                image,
                type,
                countInStock,
                price,
                rating,
                discount,
                relatedImages,
                deviceType,
                ...specs,
              });
            if(createdProduct){
                resolve({
                    status: 'OK',
                    message: 'Thêm sản phẩm mới thành công',
                    data: createdProduct
                })
            }
        }catch (e){
            reject(e)
        }
    })
}


const updateProduct = (id , data) => {
    return new Promise(async (resolve, reject) =>{
        try{
            const checkProduct = await Product.findOne({
                _id : id
            })
            if(checkProduct === null){
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                })
            }

            const { _id, ...updateData } = data;
            const updatedProduct = await Product.findByIdAndUpdate(id, updateData , {new: true})

            resolve({
                status: 'OK',
                message: 'Cập nhật thông tin sản phẩm thành công',
                data: updatedProduct
            })
        }catch (e){
            reject(e)
        }
    })
}

const getDetailsProduct = (id) => {
    return new Promise(async (resolve, reject) =>{
        try{
            const product = await Product.findOne({
                _id : id
            })
            if(product === null){
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: product
            })
        }catch (e){
            reject(e)
        }
    })
}

const getRecommendProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findById(id);
            if (!product) {
                resolve({
                    status: 'ERROR',
                    message: 'Product not found',
                });
                return;
            }
            
            const relatedProducts = await Product.find({
                _id: { $ne: id }, 
                countInStock: { $gt: 0 },   
                $or: [ 
                    { deviceType: product.deviceType }, 
                    { type: product.type } 
                ] 
            })
            .sort({ selled: -1 })  
            .limit(5);  

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: {
                    product,
                    relatedProducts
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

const deleteProduct = (id) => {
    return new Promise(async (resolve, reject) =>{
        try{
            const checkProduct = await Product.findOne({
                _id : id
            })
            if(checkProduct === null){
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                })
            }
            await Product.findByIdAndDelete(id)

            resolve({
                status: 'OK',
                message: 'Delete product SUCCESS',
            })
        }catch (e){
            reject(e)
        }
    })
}

const getAllProduct = (limit, page, sort, filter ) => {
    
    return new Promise(async (resolve, reject) =>{
        try{
            
            const totalProduct = await Product.countDocuments()
            if (filter) { 
                label = filter[0] 
                const allObjectFilter = await Product.find({ [label]: { '$regex': `.*${filter[1]}.*`, '$options': 'i' } }).limit(limit).skip(page * limit) 
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allObjectFilter,
                    total: totalProduct,
                    pageCurrent: Number(page + 1),
                    totalPage: Math.ceil(totalProduct / limit)
                })
            } 
            
            if (sort) { 
                const objectSort = {} 
                objectSort[sort[1]] = sort[0] 
                const allProductSort = await Product.find().limit(limit).skip(page * limit).sort(objectSort) 
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allProductSort,
                    total: totalProduct,
                    pageCurrent: Number(page + 1),
                    totalPage: Math.ceil(totalProduct / limit)
                })
            } else { 
                const allProduct = await Product.find().limit(limit).skip(page * limit) 
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allProduct,
                    total: totalProduct,
                    pageCurrent: Number(page + 1),
                    totalPage: Math.ceil(totalProduct / limit)
                })
            }
        } catch (e){
            reject(e)
        }
    })
}

const getProductsByDeviceType = (deviceType, limit, page) => {
    return new Promise(async (resolve, reject) => {
        try {
            const query = { deviceType };
            const totalProduct = await Product.countDocuments(query);
            const allProduct = await Product.find(query).limit(limit).skip(page * limit);
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allProduct,
                total: totalProduct,
                pageCurrent: Number(page + 1),
                totalPage: Math.ceil(totalProduct / limit),
            });
        } catch (e) {
            reject(e);
        }
    });
};


const getAllType = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allType = await Product.distinct('type')
            resolve({
                status: 'OK',
                message: 'Success',
                data: allType,
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllDeviceType = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allDeviceType = await Product.distinct('deviceType')
            resolve({
                status: 'OK',
                message: 'Success',
                data: allDeviceType,
            })
        } catch (e) {
            reject(e)
        }
    })
}

const deleteManyProduct = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Product.deleteMany({ _id: ids })
            resolve({
                status: 'OK',
                message: 'Delete product success',
            })
        } catch (e) {
            reject(e)
        }
    })
}

//review
const addProductReview = (userId, productId, reviewData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findById(productId);

            if (!product) {
                return resolve({
                    status: 'ERR',
                    message: 'Product not found',
                });
            }

            // Check if user has purchased the product
            const userHasPurchased = await Order.findOne({
                'orderItems.product': new mongoose.Types.ObjectId(productId),
                user: new mongoose.Types.ObjectId(userId),
                isPaid: true,
            }).populate('orderItems.product');
            
            // console.log('Order check failed:');
            // console.log('Product ID:', productId);
            // console.log('User ID:', userId);
            // console.log('Query result:', userHasPurchased);

            if (!userHasPurchased) {
                
                return resolve({
                    status: 'ERR',
                    message: 'Bạn phải mua sản phẩm này từ website để có thể đánh giá sản phẩm',
                });
            }

            // Check if user has already reviewed the product
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === userId
            );
            if (alreadyReviewed) {
                return resolve({
                    status: 'ERR',
                    message: 'Bạn đã đánh giá sản phẩm này rồi',
                });
            }
            const userName = userHasPurchased.shippingAddress?.fullName || 'Anonymous';
            // Add new review
            const newReview = {
                user: userId,
                name: userName, // Use user's name if available
                rating: reviewData.rating,
                comment: reviewData.comment,
            };
            product.reviews.push(newReview);

            // Recalculate the average rating
            product.numReviews = product.reviews.length;
            product.rating =
                product.reviews.reduce((acc, item) => acc + item.rating, 0) /
                product.reviews.length;

            await product.save();

            resolve({
                status: 'OK',
                message: 'Bình luận và đánh giá của bạn đã được thêm thành công',
                data: newReview,
            });
        } catch (e) {
            reject(e);
        }
    });
};


const getProductReviews = (productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findById(productId).populate('reviews.user', 'name email');
            if (!product) {
                return resolve({
                    status: 'ERR',
                    message: 'Product not found',
                });
            }

            const reviews = product.reviews.map((review) => ({
                ...review.toObject(),
                comment: review.isHidden
                    ? 'Bình luận đã bị ẩn do vi phạm điều lệ của website'
                    : review.comment,
            }));

            resolve({
                status: 'OK',   
                message: 'SUCCESS',
                data: reviews,
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getTopSellingProducts = async (limit = 6) => {
    try {
      
      const topSellingProducts = await Product.find({})
        .sort({ selled: -1 })
        .limit(limit);
      return topSellingProducts;
    } catch (error) {
      throw new Error(`Error fetching top selling products: ${error.message}`);
    }
  };

const filterProducts = (filters, limit, page) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { type, deviceType, minPrice, maxPrice, minRating, maxRating } = filters;
 
            let query = {};
            if (type !== 'all') {
                query.type = type;
            }
            if (deviceType) query.deviceType = deviceType;
            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = minPrice;
                if (maxPrice) query.price.$lte = maxPrice;
            }
            if (minRating || maxRating) {
                query.rating = {};
                if (minRating) query.rating.$gte = minRating;
                if (maxRating) query.rating.$lte = maxRating;
            }

            // Pagination setup
            const totalProducts = await Product.countDocuments(query);
            const filteredProducts = await Product.find(query)
                .limit(limit)
                .skip(page * limit);

            resolve({
                status: 'OK',
                message: 'Filtered products fetched successfully',
                data: filteredProducts,
                total: totalProducts,
                pageCurrent: Number(page + 1),
                totalPage: Math.ceil(totalProducts / limit),
            });
        } catch (e) {
            reject(e);
        }
    });
};

const toggleProductVisibility = async (productId) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        product.isHidden = !product.isHidden;
        await product.save();
        
        return product;
    } catch (error) {
        throw new Error(`Failed to toggle product visibility: ${error.message}`);
    }
};

module.exports={
    createProduct,
    updateProduct,
    getDetailsProduct,
    deleteProduct,
    getAllProduct,
    deleteManyProduct,
    getAllType,
    addProductReview,
    getProductReviews,
    getAllDeviceType,
    getProductsByDeviceType,
    filterProducts,
    getTopSellingProducts,
    getRecommendProduct,
    toggleProductVisibility
}