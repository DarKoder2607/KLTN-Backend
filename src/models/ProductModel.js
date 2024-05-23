const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, unique: true},
        image: {type: String, required: true},
        type: {type: String, required: true},
        price: {type: Number, required: true},
        countInStock: {type: Number, required: true},
        rating: {type: Number, required: true},
        //thông số ki thuật
        screen: {type: String, required: true},
        os: {type: String, required: true},
        camera: {type: String, required: true},
        cameraFront: {type: String, required: true},
        cpu: {type: String, required: true},
        ram: {type: String, required: true},
        rom: {type: String, required: true},
        microUSB: {type: String, required: true},
        battery: {type: String, required: true},
        
        discount: {type: Number},
        selled: {type: Number}
    },
    {
        timestamps: true,
    }
);
const Product = mongoose.model('Product', productSchema)
module.exports = Product;