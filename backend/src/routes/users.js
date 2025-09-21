const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { adminMiddleware, officialMiddleware } = require('../middleware/auth');
const { uploadProfilePicture, handleUploadError } = require('../utils/upload');

// Get user profile
router.get('/profile', authMiddleware, userController.getProfile);

// Update user profile
router.put('/profile', authMiddleware, userController.updateProfile);

// Upload profile picture
router.post('/profile/picture', authMiddleware, uploadProfilePicture, handleUploadError, userController.uploadProfilePicture);

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);

// Get user by ID (admin/official only)
router.get('/:id', authMiddleware, officialMiddleware, userController.getUserById);

// Update user (admin only)
router.put('/:id', authMiddleware, adminMiddleware, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

// Get users by role
router.get('/role/:role', authMiddleware, officialMiddleware, userController.getUsersByRole);

// Get users by village
router.get('/village/:village', authMiddleware, officialMiddleware, userController.getUsersByVillage);

module.exports = router;
