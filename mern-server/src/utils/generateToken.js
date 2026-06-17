const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'supersecretjwtkey';
  
  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn: '15m' } // Signed for 15 minutes
  );
};

module.exports = generateToken;
