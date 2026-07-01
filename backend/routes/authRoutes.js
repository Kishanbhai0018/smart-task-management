const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { 
  register, 
  login, 
  verifyEmail, 
  resendVerificationCode, 
  forgotPassword, 
  resetPassword, 
  googleLogin, 
  updateProfile, 
  changePassword, 
  deleteAccount 
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyEmail);
router.post("/resend-verification", resendVerificationCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", googleLogin);

// Protected routes
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);

module.exports = router;
