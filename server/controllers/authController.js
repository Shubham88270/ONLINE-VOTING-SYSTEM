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
    const { name, email, password, branch, college, university, rollNo } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const verificationToken  = generateVerifyToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name, email, password,
      branch:     branch     || '',
      college:    college    || '',
      university: university || '',
      rollNo:     rollNo     || '',
      isVerified:  false,
      isApproved:  false,
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

// POST /api/auth/admin/register-user (admin) — send OTP to verify real person
exports.adminRegisterUser = async (req, res) => {
  try {
    const { name, email, password, branch, college, university, rollNo } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) {
      if (!exists.isVerified) {
        const { generateOTP, sendOTPEmail } = require('../utils/sendOTP');
        const otp = generateOTP();
        exists.otp       = otp;
        exists.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await exists.save();
        try { await sendOTPEmail(email, exists.name, otp); } catch {}
        return res.json({
          message: `OTP resent to ${email}. Ask user to verify.`,
          userId: exists._id,
          requiresOTP: true,
        });
      }
      return res.status(400).json({ message: `Email "${email}" is already registered and verified.` });
    }

    const { generateOTP, sendOTPEmail } = require('../utils/sendOTP');
    const otp = generateOTP();

    const user = await User.create({
      name, email, password,
      branch:     branch     || '',
      college:    college    || '',
      university: university || '',
      rollNo:     rollNo     || '',
      isAdmin:    false,
      isVerified: false,
      isApproved: false,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, name, otp);
    } catch (emailErr) {
      console.error('OTP email failed:', emailErr.message);
    }

    res.status(201).json({
      message: `OTP sent to ${email}. Ask user to verify with OTP.`,
      userId:  user._id,
      voterId: user.voterId,
      requiresOTP: true,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/verify-otp — user enters OTP to complete registration
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp)
      return res.status(400).json({ message: 'userId and OTP required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: 'OTP expired. Ask admin to resend.' });

    // OTP correct — verify and approve
    user.isVerified = true;
    user.isApproved = true;
    user.otp        = null;
    user.otpExpiry  = null;
    await user.save();

    res.json({
      message: `✅ OTP verified! You can now login.`,
      email:   user.email,
      voterId: user.voterId,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/resend-otp — admin resends OTP
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    const { generateOTP, sendOTPEmail } = require('../utils/sendOTP');
    const otp = generateOTP();
    user.otp       = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try { await sendOTPEmail(user.email, user.name, otp); } catch {}
    res.json({ message: `OTP resent to ${user.email}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/auth/users/:id (admin) — delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isAdmin) return res.status(403).json({ message: 'Cannot delete admin user' });
    await user.deleteOne();
    res.json({ message: `User "${user.name}" deleted successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.updateProfile = async (req, res) => {
  try {
    const { name, photo, branch, college, university, rollNo } = req.body;
    const user = await User.findById(req.user._id);
    if (name)       user.name       = name;
    if (photo)      user.photo      = photo;
    if (branch      !== undefined) user.branch     = branch;
    if (college     !== undefined) user.college    = college;
    if (university  !== undefined) user.university = university;
    if (rollNo      !== undefined) user.rollNo     = rollNo;
    await user.save();
    res.json({ message: 'Profile updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/change-password — change password with old password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password min 6 characters' });

    const user = await User.findById(req.user._id);
    const match = await user.matchPassword(oldPassword);
    if (!match)
      return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: '✅ Password changed successfully!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/forgot-password — send OTP to email for password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    const { generateOTP, sendOTPEmail } = require('../utils/sendOTP');
    const otp = generateOTP();
    user.otp       = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    try {
      await sendOTPEmail(email, user.name, otp);
    } catch (e) {
      console.error('OTP email failed:', e.message);
    }

    res.json({ message: `OTP sent to ${email}`, userId: user._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/reset-password — verify OTP then set new password
exports.resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    if (!userId || !otp || !newPassword)
      return res.status(400).json({ message: 'All fields required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password min 6 characters' });

    const user = await User.findById(userId);
    if (!user)              return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: 'OTP expired. Request again.' });

    user.password  = newPassword;
    user.otp       = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: '✅ Password reset successfully! You can now login.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
