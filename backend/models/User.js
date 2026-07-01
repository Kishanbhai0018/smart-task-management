const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["User", "Admin"], default: "User" },
  googleId: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  resetCode: { type: String },
  resetExpires: { type: Date },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  dailyStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  settings: {
    theme: { type: String, default: "Light" },
    language: { type: String, default: "English" },
    timeZone: { type: String, default: "UTC" },
    emailNotifications: { type: Boolean, default: true },
    browserNotifications: { type: Boolean, default: true },
    privacyPublic: { type: Boolean, default: true }
  },
  achievements: {
    type: Array,
    default: [
      { id: "first_task", name: "First Step", desc: "Create your first task", progress: 0, maxProgress: 1, completed: false, xpReward: 10 },
      { id: "complete_task", name: "Task Beginner", desc: "Complete 1 task", progress: 0, maxProgress: 1, completed: false, xpReward: 20 },
      { id: "complete_5_tasks", name: "Task Master", desc: "Complete 5 tasks", progress: 0, maxProgress: 5, completed: false, xpReward: 100 },
      { id: "complete_15_tasks", name: "Productivity Legend", desc: "Complete 15 tasks", progress: 0, maxProgress: 15, completed: false, xpReward: 250 },
      { id: "high_priority", name: "High Stakes", desc: "Complete a High priority task", progress: 0, maxProgress: 1, completed: false, xpReward: 50 },
      { id: "streak_3", name: "Streak Starter", desc: "Reach a 3-day daily streak", progress: 0, maxProgress: 3, completed: false, xpReward: 150 },
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
