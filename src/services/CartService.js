const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');

const addToCart = async (userId, productId, amount) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  
  let cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    cart = new Cart({ user: userId, cartItems: [] });
  }
  
  const existingItem = cart.cartItems.find(item => item.product.toString() === productId);
  
  if (existingItem) {
    existingItem.amount += amount;
  } else {
    cart.cartItems.push({ 
      product: productId, 
      name: product.name, 
      image: product.image, 
      amount, 
      price: product.price , 
      discount: product.discount 
    });
  }
  
  await cart.save();
  return cart;
};


const removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');
  
  cart.cartItems = cart.cartItems.filter(item => item.product.toString() !== productId);
  await cart.save();
  const updatedCart = await Cart.findOne({ user: userId }).populate({
    path: 'cartItems.product',
    select: 'name price image discount countInStock', // Add 'image' field to be returned
  });
  
  return updatedCart;
};

const getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('cartItems.product');
  return cart;
};

const updateCartItemQuantity = async (userId, productId, amount) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');
  
  const item = cart.cartItems.find(item => item.product.toString() === productId);
  if (!item) throw new Error('Product not found in cart');
  
  if (amount <= 0) {
    cart.cartItems = cart.cartItems.filter(item => item.product.toString() !== productId);
  } else {
    item.amount = amount;
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
  }

  await cart.save();
  const updatedCart = await Cart.findOne({ user: userId }).populate({
    path: 'cartItems.product',
    select: 'name price image discount countInStock', // Add 'image' field to be returned
  });

  return updatedCart;
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');
  
  cart.cartItems = [];
  await cart.save();
  return cart;
};



module.exports = { 
    addToCart, 
    removeFromCart, 
    getCart ,
    updateCartItemQuantity,
    clearCart
};
