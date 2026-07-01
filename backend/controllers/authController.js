const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Configure NodeMailer transporter (uses fallback for local development)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || "mock_user",
    pass: process.env.SMTP_PASS || "mock_pass"
  }
});

const sendMailHelper = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"SmartTask Notification" <no-reply@smarttask.com>',
      to,
      subject,
      text
    });
    console.log(`[EMAIL SUCCESS] Mail sent to ${to}`);
  } catch (err) {
    console.log(`\n======================================================`);
    console.log(`[EMAIL FALLBACK MOCK/CONSOLE LOG]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${text}`);
    console.log(`======================================================\n`);
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    
    // Generate a 6-digit random code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({ 
      name, 
      email, 
      password: hashed,
      verificationCode,
      isVerified: false
    });

    // Send verification email
    await sendMailHelper(
      email, 
      "Verify Your Email - SmartTask", 
      `Hello ${name},\n\nYour 6-digit verification code is: ${verificationCode}\n\nPlease enter this code in the app to verify your email address.`
    );

    res.status(201).json({
      _id: user._id, 
      name: user.name, 
      email: user.email,
      isVerified: user.isVerified,
      token: generateToken(user._id),
      message: "Registration successful. Please verify your email."
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id, 
      name: user.name, 
      email: user.email,
      role: user.role || "User",
      isVerified: user.isVerified,
      settings: user.settings,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    await user.save();

    await sendMailHelper(
      email, 
      "Verify Your Email - SmartTask", 
      `Hello ${user.name},\n\nYour new 6-digit verification code is: ${verificationCode}\n\nPlease enter this code to verify your account.`
    );

    res.json({ success: true, message: "Verification code sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No account found with this email" });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    user.resetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendMailHelper(
      email,
      "Password Reset Code - SmartTask",
      `You are receiving this because you requested a password reset.\n\nYour password reset code is: ${resetCode}\n\nThis code expires in 1 hour.`
    );

    res.json({ success: true, message: "Reset code sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ 
      email, 
      resetCode: code,
      resetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google ID Token (credential) is required." });
    }

    let email, name, googleId;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    } catch (verifyErr) {
      console.error("Google token verification failed:", verifyErr);
      return res.status(401).json({ message: "Invalid Google token." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create user if not exists
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await User.create({
        name,
        email,
        password: dummyPassword,
        googleId,
        isVerified: true // Google accounts are pre-verified
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "User",
      isVerified: user.isVerified,
      settings: user.settings,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, theme, language, timeZone, emailNotifications, browserNotifications, privacyPublic } = req.body;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    
    // Save settings
    if (!user.settings) user.settings = {};
    if (theme) user.settings.theme = theme;
    if (language) user.settings.language = language;
    if (timeZone) user.settings.timeZone = timeZone;
    if (emailNotifications !== undefined) user.settings.emailNotifications = emailNotifications;
    if (browserNotifications !== undefined) user.settings.browserNotifications = browserNotifications;
    if (privacyPublic !== undefined) user.settings.privacyPublic = privacyPublic;

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      settings: user.settings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user);
    // Delete their tasks too
    const Task = require("../models/Task");
    await Task.deleteMany({ user: req.user });
    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
