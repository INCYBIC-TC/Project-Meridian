const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to extract Bearer token from authorization header
const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Not authorized: Missing token' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'supersecretjwtkey';

    // Verify JWT
    const decoded = jwt.verify(token, secret);

    // Fetch user context (excluding password)
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Not authorized: User not found' });
    }

    // Role-ready structure mapping
    req.user = {
      id: user._id.toString(),
      role: user.role
    };

    return next();
  } catch (error) {
    console.error(`[Auth] JWT Verification failed: ${error.message}`);
    
    // Explicitly handle token expiration
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Not authorized: Token expired' });
    }

    return res.status(401).json({ error: 'Not authorized: Invalid token' });
  }
};

module.exports = protect;
