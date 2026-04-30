const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const { validationResult } = require('express-validator');
const User     = require('../models/User');
const { sendVerificationEmail } = require('../utils/sendEmail');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const generateVerifyToken = () => crypto.randomBytes(32).toString('hex');

// POST /api/auth/register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const verificationToken  = generateVerifyToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name, email, password,
      isVerified:  false,
      isApproved:  false,  // pending admin approval
      verificationToken,
      verificationExpiry,
    });

    try { await sendVerificationEmail(email, name, verificationToken); } catch {}

    res.status(201).json({
      message: `Registration successful! Check your email to verify. Your Voter ID is: ${user.voterId}`,
      voterId: user.voterId,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isVerified)
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        notVerified: true,
      });

    // Admin users bypass approval check
    if (!user.isAdmin && !user.isApproved)
      return res.status(403).json({
        message: 'Your account is pending admin approval. Please wait.',
        pendingApproval: true,
      });

    res.json({
      _id:        user._id,
      name:       user.name,
      email:      user.email,
      voterId:    user.voterId,
      photo:      user.photo,
      isAdmin:    user.isAdmin,
      isApproved: user.isApproved,
      votedElections: user.votedElections,
      token:      generateToken(user._id),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({
      verificationToken:  token,
      verificationExpiry: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired link' });

    user.isVerified         = true;
    user.verificationToken  = null;
    user.verificationExpiry = null;
    await user.save();
    res.redirect(`${process.env.CLIENT_URL}/auth?verified=true`);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/resend-verification
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)           return res.status(404).json({ message: 'Email not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    user.verificationToken  = generateVerifyToken();
    user.verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    await sendVerificationEmail(email, user.name, user.verificationToken);
    res.json({ message: 'Verification email resent!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

// GET /api/auth/users (admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/auth/users/:id/approve (admin) — approve voter
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isApproved = true;
    user.isVerified = true;          // auto-verify when admin approves
    user.verificationToken  = null;  // clear pending token
    user.verificationExpiry = null;
    await user.save();
    res.json({ message: `${user.name} approved successfully`, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/auth/users/:id/reject (admin) — reject voter
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isApproved = false;
    await user.save();
    res.json({ message: `${user.name} rejected` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/auth/users/:id/password (admin)
exports.setUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Min 6 characters' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = password;
    await user.save();
    res.json({ message: `Password updated for ${user.name}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/admin/register-user (admin)
exports.adminRegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({
      name, email, password,
      isAdmin:    false,
      isVerified: true,
      isApproved: true,  // admin-registered users auto-approved
    });
    res.status(201).json({
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      voterId: user.voterId,
      message: `User "${user.name}" registered with Voter ID: ${user.voterId}`,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/auth/profile — update own profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, photo } = req.body;
    const user = await User.findById(req.user._id);
    if (name)  user.name  = name;
    if (photo) user.photo = photo;
    await user.save();
    res.json({ message: 'Profile updated', name: user.name, photo: user.photo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
