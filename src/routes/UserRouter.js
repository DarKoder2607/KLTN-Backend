const express = require("express");
const router = express.Router()
const UserController = require('../controller/UserController');
const { authMiddleware, authUserMiddleware } = require("../middleware/authMiddleware");

router.post('/sign-up', UserController.createUser)
router.post('/sign-in', UserController.loginUser)
router.post('/log-out', UserController.logoutUser)
router.put('/update-user/:id', authUserMiddleware, UserController.updateUser)
router.delete('/delete-user/:id', authMiddleware, UserController.deleteUser)
router.get('/getAll',authMiddleware, UserController.getAllUser)
router.get('/get-details/:id', authUserMiddleware, UserController.getDetailsUser)
router.post('/refresh-token', UserController.refreshToken)
router.post('/delete-many', authMiddleware, UserController.deleteMany)
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.post('/sign-in-google', UserController.createGoogleUser)
router.put('/lock/:id', authMiddleware, UserController.lockUser);
router.put('/unlock/:id', authMiddleware, UserController.unlockUser);
router.get('/:id/notifications', UserController.getUserNotifications);
router.put('/:id/notifications/read', UserController.markNotificationsAsRead);


module.exports = router
