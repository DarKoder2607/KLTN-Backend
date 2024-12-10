const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },  
  image: { type: String, required: true },  
  amount: { type: Number, required: true, default: 1 },  
  price: { type: Number, required: true },  
  discount: { type: Number },  
}, 
{
  timestamps: true,  
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cartItems: [cartItemSchema],
  },
  {
    timestamps: true, 
  }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
