const { addToCart, removeFromCart, getCart, updateCartItemQuantity, clearCart } = require('../services/CartService');

const addToCartController = async (req, res) => {

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });  
    }
  
    const { productId, quantity } = req.body;
    try {
      const cart = await addToCart(req.user.id, productId, quantity);
      res.status(200).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  const removeFromCartController = async (req, res) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' }); // Trả về lỗi nếu không có user
    }
  
    const { productId } = req.params;
    try {
      const cart = await removeFromCart(req.user.id, productId);
      res.status(200).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  const getCartController = async (req, res) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });  
    }
  
    try {
      const cart = await getCart(req.user.id);
      res.status(200).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  const updateCartItemQuantityController = async (req, res) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
  
    const { productId, quantity } = req.body;
    try {
      const cart = await updateCartItemQuantity(req.user.id, productId, quantity);
      res.status(200).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  const clearCartController = async (req, res) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
  
    try {
      const cart = await clearCart(req.user.id);
      res.status(200).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

module.exports = { 
    addToCartController, 
    removeFromCartController, 
    getCartController ,
    updateCartItemQuantityController,
    clearCartController
};
