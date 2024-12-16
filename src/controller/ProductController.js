const ProductService = require('../services/ProductService')
const Product = require("../models/ProductModel")

const createProduct = async(req, res ) => {
    
    try{
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
          } = req.body;
          if (
            !name ||
            !image ||
            !type ||
            !countInStock ||
            !price ||
            !discount ||
            !deviceType
          ) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        }
        const response = await ProductService.createProduct(req.body)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const updateProduct = async(req, res ) => {
    
    try{
        const productId = req.params.id
        const data = req.body
        if(!productId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'
            })
        }
        const response = await ProductService.updateProduct(productId, data)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const getDetailsProduct = async(req, res ) => {
    try{
        const productId = req.params.id
        if(!productId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'
            })
        }
        const response = await ProductService.getDetailsProduct(productId)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const getRecommendProduct = async(req, res ) => {
    try{
        const productId = req.params.id
        if(!productId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'
            })
        }
        const response = await ProductService.getRecommendProduct(productId)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const deleteProduct = async(req, res ) => {
    try{
        const productId = req.params.id
        if(!productId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'
            })
        }
        const response = await ProductService.deleteProduct(productId)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const getAllProduct = async(req, res ) => {
    try{
        const { limit, page, sort, filter }= req.query
        const response = await ProductService.getAllProduct(Number(limit) , Number(page), sort , filter)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const getProductsByDeviceType = async (req, res) => {
    try {
        const { deviceType, limit, page } = req.query;
        const response = await ProductService.getProductsByDeviceType(deviceType, Number(limit), Number(page));
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e
        });
    }
};


const getAllType = async (req, res) => {
    try {
        const response = await ProductService.getAllType()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllDeviceType = async (req, res) => {
    try {
        const response = await ProductService.getAllDeviceType()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}


const deleteMany = async (req, res) => {
    try {
        const ids = req.body.ids
        if (!ids) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The ids is required'
            })
        }
        const response = await ProductService.deleteManyProduct(ids)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

//review    
const addProductReview = async (req, res) => {
    try {
        const userId = req.user?.id; // Lấy user ID từ token đã xác thực
        const productId = req.params.id;
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Rating and comment are required',
            });
        }

        const response = await ProductService.addProductReview(userId, productId, { rating, comment });

        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            status: 'ERR',
            message: e.message,
        });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.id;

        const response = await ProductService.getProductReviews(productId);

        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            status: 'ERR',
            message: e.message,
        });
    }
};

const hideProductReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Product not found',
            });
        }

        const review = product.reviews.id(reviewId);
        if (!review) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Review not found',
            });
        }

        review.isHidden = true;
        await product.save();

        return res.status(200).json({
            status: 'OK',
            message: 'Review hidden successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: error.message,
        });
    }
};
const unhideProductReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Product not found',
            });
        }

        const review = product.reviews.id(reviewId);
        if (!review) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Review not found',
            });
        }

        review.isHidden = false;
        await product.save();

        return res.status(200).json({
            status: 'OK',
            message: 'Review unhidden successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: error.message,
        });
    }
};

const filterProducts = async (req, res) => {
    try {
        const { type, deviceType, minPrice, maxPrice, minRating, maxRating, limit, page } = req.query;

        const filters = {
            type,
            deviceType,
            minPrice: Number(minPrice),
            maxPrice: Number(maxPrice),
            minRating: Number(minRating),
            maxRating: Number(maxRating),
        };

        const response = await ProductService.filterProducts(filters, Number(limit), Number(page));
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e.message || 'Error occurred',
        });
    }
};

const getTopSellingProducts = async (req, res) => {
    try {
      // Get the limit from query params or default to 6
      const limit = parseInt(req.query.limit) || 6;
      const topSellingProducts = await ProductService.getTopSellingProducts(limit);
  
      res.status(200).json({
        success: true,
        data: topSellingProducts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

const getAllBrands = async (req, res) => {
    try {
        const brands = await Product.distinct('type'); // Lấy danh sách thương hiệu duy nhất
        res.status(200).json({
            status: 'OK',
            data: brands,
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: 'Failed to retrieve brands',
            error: error.message,
        });
    }
};

const toggleProductVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductService.toggleProductVisibility(id);
        
        res.status(200).json({ status: 'OK', data: product });
    } catch (error) {
        res.status(500).json({ message: 'Failed to toggle product visibility', error: error.message });
    }
};

module.exports = {
    createProduct,
    updateProduct,
    getDetailsProduct,
    deleteProduct,
    getAllProduct,
    deleteMany,
    getAllType,
    getProductReviews,
    addProductReview,
    hideProductReview,
    unhideProductReview,
    getAllDeviceType,
    getProductsByDeviceType,
    filterProducts,
    getTopSellingProducts,
    getAllBrands,
    getRecommendProduct,
    toggleProductVisibility
}