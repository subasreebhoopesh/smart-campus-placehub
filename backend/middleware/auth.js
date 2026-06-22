const jwt = require('jsonwebtoken');

// Use a consistent JWT secret - must match what was used to sign tokens
const JWT_SECRET = process.env.JWT_SECRET || 'placehub_jwt_secret_2024_stable';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // Try primary secret first, then fallback secrets for backward compatibility
    const secrets = [
      JWT_SECRET,
      'placehub_super_secret_jwt_key_2026',
      'placehub_jwt_secret_2024_stable',
      'your_jwt_secret',
      'your_jwt_secret_key_change_this_in_production',
    ];

    let decoded = null;
    for (const secret of secrets) {
      try {
        decoded = jwt.verify(token, secret);
        break;
      } catch (e) {
        continue;
      }
    }

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
