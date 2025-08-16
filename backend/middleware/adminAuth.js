const { protect } = require('./auth');
const User = require('../models/User');

/**
 * Middleware to check if user is authenticated and has admin role
 */
const adminOnly = async (req, res, next) => {
  try {
    // First check if user is authenticated
    await new Promise((resolve, reject) => {
      protect(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Check if user has admin role
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required for admin operations'
    });
  }
};

/**
 * Middleware to check if user is authenticated (admin or regular user)
 */
const authOptional = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      protect(req, res, (error) => {
        if (error) {
          // If auth fails, continue without user (for public endpoints)
          req.user = null;
        }
        resolve();
      });
    });
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Create admin user if none exists
 */
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminUser = new User({
        name: 'MovieFlix Admin',
        email: 'admin@movieflix.com',
        password: 'admin123',
        role: 'admin',
        subscription: 'premium'
      });
      
      await adminUser.save();
      console.log('🔑 Default admin user created: admin@movieflix.com / admin123');
    }
  } catch (error) {
    console.error('Failed to create default admin:', error.message);
  }
};

module.exports = {
  adminOnly,
  authOptional,
  createDefaultAdmin
};
