const { verifyToken } = require('../config/jwt');
const db = require('../config/db');

/**
 * Middleware to authenticate requests using JWT Bearer Token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Malformed authorization token.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token.'
      });
    }

    // Retrieve user from database to ensure account is active
    const user = await db.queryOne('SELECT user_id, full_name, email, phone, role, status FROM users WHERE user_id = ?', [decoded.id]);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact system support.'
      });
    }

    // If pharmacist, attach pharmacy_id if available
    if (user.role === 'pharmacist') {
      const pharmacy = await db.queryOne('SELECT pharmacy_id, pharmacy_name, approval_status FROM pharmacies WHERE user_id = ?', [user.user_id]);
      if (pharmacy) {
        user.pharmacy_id = pharmacy.pharmacy_id;
        user.pharmacy_name = pharmacy.pharmacy_name;
        user.pharmacy_approval_status = pharmacy.approval_status;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * @param  {...string} allowedRoles - 'patient', 'pharmacist', 'admin'
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of [${allowedRoles.join(', ')}] roles.`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
