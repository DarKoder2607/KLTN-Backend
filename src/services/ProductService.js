const Product = require("../models/ProductModel")

const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) =>{
        const {name , image, type, countInStock, price, rating, description} = newProduct
        try{
            const checkProduct = await Product.findOne({
                name: name
            })
            if(checkProduct !== null){
                resolve({
                    status: 'OK',
                    message: 'The name of product is already'
                })
            }
            const createdProduct = await Product.create({
                name , 
                image, 
                type, 
                countInStock, 
                price, 
                rating, 
                description
            })
            if(createdProduct){
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
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
            const updatedProduct = await Product.findByIdAndUpdate(id, data, {new: true})

            resolve({
                status: 'OK',
                message: 'SUCCESS',
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

const getAllProduct = (limit, page) => {
    return new Promise(async (resolve, reject) =>{
        try{
            const totalProduct = await Product.countDocuments()
            const allProduct = await Product.find().limit(limit).skip(page * limit)
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allProduct,
                total: totalProduct,
                pageCurrent: page+ 1,
                totalPage: Math.ceil(totalProduct/ limit)
            })
        }catch (e){
            reject(e)
        }
    })
}
module.exports={
    createProduct,
    updateProduct,
    getDetailsProduct,
    deleteProduct,
    getAllProduct
}