const express = require("express");
const router = express.Router()
const UserController = require('../controller/UserController');
const { authMiddleware, authUserMiddleware } = require("../middleware/authMiddleware");

router.post('/sign-up', UserController.createUser)
router.post('/sign-in', UserController.loginUser)
router.post('/log-out', UserController.logoutUser)
router.put('/update-user/:id',  UserController.updateUser)
router.delete('/delete-user/:id', UserController.deleteUser)
router.get('/getAll',UserController.getAllUser)
router.get('/get-details/:id',  UserController.getDetailsUser)
router.post('/refresh-token', UserController.refreshToken)
router.post('/delete-many',  UserController.deleteMany)
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

module.exports = router
