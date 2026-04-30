const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── AUTHENTICATION — JWT token verify karo ──────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized — no token provided' });

  try {
    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user)
      return res.status(401).json({ message: 'User not found — token invalid' });

    // Check if user is verified
    if (!user.isVerified)
      return res.status(403).json({ message: 'Email not verified. Please verify your email first.' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Session expired — please login again' });
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ── AUTHORIZATION — Admin only ───────────────────────────
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin)
    return res.status(403).json({ message: 'Access denied — Admin only' });
  next();
};

// ── AUTHORIZATION — Verified users only ─────────────────
const verifiedOnly = (req, res, next) => {
  if (!req.user.isVerified)
    return res.status(403).json({ message: 'Please verify your email to access this resource' });
  next();
};

module.exports = { protect, adminOnly, verifiedOnly };
