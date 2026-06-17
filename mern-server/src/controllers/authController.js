const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const generateToken = require('../utils/generateToken');
const asyncWrapper = require('../utils/asyncWrapper');

// Helper: SHA-256 Token Hashing
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Helper: Parse cookies manually (zero-dependency)
const extractCookie = (req, name) => {
  const rc = req.headers.cookie;
  if (rc) {
    const list = {};
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list[name];
  }
  return null;
};

// Helper: Set secure httpOnly cookie
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// REGISTER USER (Unchanged response contract)
exports.register = asyncWrapper(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already registered with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  return res.status(201).json({
    message: 'User registered successfully',
    userId: user._id
  });
});

// LOGIN USER (Cookie-only refresh delivery)
exports.login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id, user.role);

  // Generate secure random refresh token
  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const hashedRefreshToken = hashToken(rawRefreshToken);

  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Persist hashed token in database with device/IP metadata
  await RefreshToken.create({
    userId: user._id,
    token: hashedRefreshToken,
    ipAddress: clientIp,
    userAgent: userAgent,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // Attach refresh token to httpOnly cookie
  setRefreshTokenCookie(res, rawRefreshToken);

  return res.status(200).json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    }
  });
});

// REFRESH ACCESS TOKEN (Strict cookie extraction & rotation)
exports.refresh = asyncWrapper(async (req, res) => {
  const rawToken = extractCookie(req, 'refreshToken');
  
  if (!rawToken) {
    return res.status(401).json({ error: 'Not authorized: Refresh token missing' });
  }

  const hashed = hashToken(rawToken);
  const storedToken = await RefreshToken.findOne({ token: hashed });

  if (!storedToken) {
    return res.status(401).json({ error: 'Not authorized: Invalid refresh token' });
  }

  if (storedToken.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    return res.status(401).json({ error: 'Not authorized: Refresh token expired' });
  }

  // Device/IP binding verification
  const currentIp = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  const currentUserAgent = req.headers['user-agent'] || 'unknown';

  if (storedToken.ipAddress !== currentIp || storedToken.userAgent !== currentUserAgent) {
    // Session hijacking safeguard: revoke all sessions or delete compromised token
    await RefreshToken.deleteOne({ _id: storedToken._id });
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: 'Security Alert: Session binding mismatch' });
  }

  const user = await User.findById(storedToken.userId);
  if (!user) {
    return res.status(401).json({ error: 'Not authorized: User not found' });
  }

  // Generate new short-lived access token
  const newAccessToken = generateToken(user._id, user.role);

  // Rotate Refresh Token (one-time use)
  await RefreshToken.deleteOne({ _id: storedToken._id });

  const newRawToken = crypto.randomBytes(40).toString('hex');
  await RefreshToken.create({
    userId: user._id,
    token: hashToken(newRawToken),
    ipAddress: currentIp,
    userAgent: currentUserAgent,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  setRefreshTokenCookie(res, newRawToken);

  return res.status(200).json({
    token: newAccessToken
  });
});

// LOGOUT USER (Session invalidation & cookie purge)
exports.logout = asyncWrapper(async (req, res) => {
  const rawToken = extractCookie(req, 'refreshToken');

  if (rawToken) {
    const hashed = hashToken(rawToken);
    // Purge specific session token from DB
    await RefreshToken.deleteOne({ token: hashed });
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return res.status(200).json({
    message: 'Logged out successfully'
  });
});
