const express = require("express");
const router = express.Router()
const ProductController = require('../controller/ProductController');
const { authMiddleware } = require("../middleware/authMiddleware");

router.post('/create', ProductController.createProduct)
router.put('/update/:id',  ProductController.updateProduct)
router.get('/details/:id', ProductController.getDetailsProduct)
router.delete('/delete/:id',  ProductController.deleteProduct)
router.get('/getAll', ProductController.getAllProduct)
router.post('/delete-many',  ProductController.deleteMany)
router.get('/get-all-type', ProductController.getAllType)



module.exports = router
