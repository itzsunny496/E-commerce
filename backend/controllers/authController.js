const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const axios = require('axios');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, isSeller } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password_hash,
      auth_provider: 'local',
      role: isSeller ? 'seller' : 'user'
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update logged in user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    OAuth/OTP Firebase Verification Login
// @route   POST /api/auth/social
// @access  Public
exports.socialLogin = async (req, res) => {
  try {
    const { idToken, provider } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Please provide a Firebase ID Token' });
    }

    // Call Google's Identity Toolkit API to verify the ID token using your Web API Key
    const firebaseApiKey = process.env.FIREBASE_API_KEY;
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
      { idToken }
    );

    const firebaseUser = response.data.users?.[0];
    if (!firebaseUser) {
      return res.status(400).json({ success: false, error: 'Firebase authentication failed' });
    }

    const email = firebaseUser.email || `${firebaseUser.localId}@firebase.phone`;
    const name = firebaseUser.displayName || firebaseUser.phoneNumber || 'Firebase User';

    let user = await User.findOne({ email });

    if (!user) {
      // Create user if not exists
      const normalizedProvider = provider === 'phone' ? 'phone' : 'google';
      user = await User.create({
        name,
        email,
        phone: firebaseUser.phoneNumber || '',
        auth_provider: normalizedProvider,
        role: 'user'
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.reset_password_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.reset_password_expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Since they don't have mail transporter configured, log it directly for local testing!
    console.log(`\n========================================`);
    console.log(`🔑 PASSWORD RESET TOKEN FOR: ${email}`);
    console.log(`Token: ${resetToken}`);
    console.log(`========================================\n`);

    res.status(200).json({
      success: true,
      message: 'Password reset token generated and logged to backend console.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      reset_password_token: resetPasswordToken,
      reset_password_expires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(req.body.password, salt);
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
