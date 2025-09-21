const User = require('../models/User');
const logger = require('../utils/logger');
const { getFileUrl } = require('../utils/upload');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Failed to get user profile', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        error: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, email, phone, village, state, district } = req.body;
      
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update allowed fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (village) user.village = village;
      if (state) user.state = state;
      if (district) user.district = district;

      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: userResponse
      });
    } catch (error) {
      logger.error('Failed to update user profile', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update profile picture URL
      user.profilePicture = getFileUrl(req, req.file.filename);
      await user.save();

      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      logger.error('Failed to upload profile picture', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile picture',
        error: error.message
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, role, village, state } = req.query;
      
      const filter = {};
      if (role) filter.role = role;
      if (village) filter.village = village;
      if (state) filter.state = state;

      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get all users', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Failed to get user by ID', { error: error.message, userId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { name, email, phone, role, village, state, district, isActive } = req.body;
      
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update allowed fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (role) user.role = role;
      if (village) user.village = village;
      if (state) user.state = state;
      if (district) user.district = district;
      if (isActive !== undefined) user.isActive = isActive;

      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'User updated successfully',
        data: userResponse
      });
    } catch (error) {
      logger.error('Failed to update user', { error: error.message, userId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await User.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete user', { error: error.message, userId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }

  async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const users = await User.find({ role })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments({ role });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get users by role', { error: error.message, role: req.params.role });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users by role',
        error: error.message
      });
    }
  }

  async getUsersByVillage(req, res) {
    try {
      const { village } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const users = await User.find({ village })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments({ village });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get users by village', { error: error.message, village: req.params.village });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users by village',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
