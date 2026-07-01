const User = require("../models/User");

// Helper to get initials
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Helper to check achievements progress
const checkAchievements = (user) => {
  let xpGranted = 0;
  
  if (!user.achievements || user.achievements.length === 0) {
    user.achievements = [
      { id: "first_task", name: "First Step", desc: "Create your first task", progress: 0, maxProgress: 1, completed: false, xpReward: 10 },
      { id: "complete_task", name: "Task Beginner", desc: "Complete 1 task", progress: 0, maxProgress: 1, completed: false, xpReward: 20 },
      { id: "complete_5_tasks", name: "Task Master", desc: "Complete 5 tasks", progress: 0, maxProgress: 5, completed: false, xpReward: 100 },
      { id: "complete_15_tasks", name: "Productivity Legend", desc: "Complete 15 tasks", progress: 0, maxProgress: 15, completed: false, xpReward: 250 },
      { id: "high_priority", name: "High Stakes", desc: "Complete a High priority task", progress: 0, maxProgress: 1, completed: false, xpReward: 50 },
      { id: "streak_3", name: "Streak Starter", desc: "Reach a 3-day daily streak", progress: 0, maxProgress: 3, completed: false, xpReward: 150 },
    ];
  }

  user.achievements.forEach((ach) => {
    if (!ach.completed && ach.progress >= ach.maxProgress) {
      ach.completed = true;
      xpGranted += ach.xpReward;
      if (!user.badges.includes(ach.id)) {
        user.badges.push(ach.id);
      }
    }
  });

  if (xpGranted > 0) {
    user.xp += xpGranted;
    user.level = Math.floor(user.xp / 100) + 1;
  }
};

// Get User Gamification Stats
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle Streak Calculation
    const todayStr = new Date().toDateString();
    const lastActive = user.lastActiveDate;

    if (!lastActive) {
      user.dailyStreak = 1;
      user.xp += 10; // First login bonus
      user.lastActiveDate = new Date();
    } else {
      const lastActiveStr = new Date(lastActive).toDateString();
      if (todayStr !== lastActiveStr) {
        const diffTime = Math.abs(new Date(todayStr) - new Date(lastActiveStr));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          user.dailyStreak += 1;
          user.xp += 20; // 20 XP for streak day
        } else if (diffDays > 1) {
          user.dailyStreak = 1; // reset streak
        }
        user.lastActiveDate = new Date();
      }
    }

    // Initialize/sync achievements schema if empty
    if (!user.achievements || user.achievements.length === 0) {
      user.achievements = [
        { id: "first_task", name: "First Step", desc: "Create your first task", progress: 0, maxProgress: 1, completed: false, xpReward: 10 },
        { id: "complete_task", name: "Task Beginner", desc: "Complete 1 task", progress: 0, maxProgress: 1, completed: false, xpReward: 20 },
        { id: "complete_5_tasks", name: "Task Master", desc: "Complete 5 tasks", progress: 0, maxProgress: 5, completed: false, xpReward: 100 },
        { id: "complete_15_tasks", name: "Productivity Legend", desc: "Complete 15 tasks", progress: 0, maxProgress: 15, completed: false, xpReward: 250 },
        { id: "high_priority", name: "High Stakes", desc: "Complete a High priority task", progress: 0, maxProgress: 1, completed: false, xpReward: 50 },
        { id: "streak_3", name: "Streak Starter", desc: "Reach a 3-day daily streak", progress: 0, maxProgress: 3, completed: false, xpReward: 150 },
      ];
    }

    const streakAch = user.achievements.find(a => a.id === "streak_3");
    if (streakAch) {
      streakAch.progress = Math.min(streakAch.maxProgress, user.dailyStreak);
    }

    user.level = Math.floor(user.xp / 100) + 1;

    // Check achievement completions
    checkAchievements(user);

    user.markModified("achievements");
    await user.save();

    res.json({
      xp: user.xp,
      level: user.level,
      badges: user.badges,
      dailyStreak: user.dailyStreak,
      achievements: user.achievements
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Leaderboard (Combining Real & Mock Users for full dashboard)
exports.getLeaderboard = async (req, res) => {
  try {
    const realUsers = await User.find({}, "name xp level badges").sort({ xp: -1 }).limit(10);
    
    let leaderboard = realUsers.map(u => ({
      name: u.name,
      xp: u.xp,
      level: u.level,
      isBot: false,
      avatar: getInitials(u.name)
    }));

    const mockBots = [
      { name: "CodeNinja ⚔️", xp: 480, level: 5, isBot: true, avatar: "CN" },
      { name: "TaskMasterPro 🚀", xp: 390, level: 4, isBot: true, avatar: "TM" },
      { name: "FocusBeast 🎯", xp: 280, level: 3, isBot: true, avatar: "FB" },
      { name: "StreakKing 🔥", xp: 190, level: 2, isBot: true, avatar: "SK" },
      { name: "EarlyBird 🌅", xp: 120, level: 2, isBot: true, avatar: "EB" }
    ];

    leaderboard = [...leaderboard, ...mockBots];
    leaderboard.sort((a, b) => b.xp - a.xp);
    leaderboard = leaderboard.slice(0, 10).map((u, idx) => ({
      rank: idx + 1,
      ...u
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Main XP Reward function called by controllers
exports.rewardXP = async (userId, actionType, details = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (!user.achievements || user.achievements.length === 0) {
      user.achievements = [
        { id: "first_task", name: "First Step", desc: "Create your first task", progress: 0, maxProgress: 1, completed: false, xpReward: 10 },
        { id: "complete_task", name: "Task Beginner", desc: "Complete 1 task", progress: 0, maxProgress: 1, completed: false, xpReward: 20 },
        { id: "complete_5_tasks", name: "Task Master", desc: "Complete 5 tasks", progress: 0, maxProgress: 5, completed: false, xpReward: 100 },
        { id: "complete_15_tasks", name: "Productivity Legend", desc: "Complete 15 tasks", progress: 0, maxProgress: 15, completed: false, xpReward: 250 },
        { id: "high_priority", name: "High Stakes", desc: "Complete a High priority task", progress: 0, maxProgress: 1, completed: false, xpReward: 50 },
        { id: "streak_3", name: "Streak Starter", desc: "Reach a 3-day daily streak", progress: 0, maxProgress: 3, completed: false, xpReward: 150 },
      ];
    }

    let xpEarned = 0;

    if (actionType === "CREATE_TASK") {
      xpEarned = 10;
      
      const firstTaskAch = user.achievements.find(a => a.id === "first_task");
      if (firstTaskAch && firstTaskAch.progress < firstTaskAch.maxProgress) {
        firstTaskAch.progress += 1;
      }
    } 
    else if (actionType === "COMPLETE_TASK") {
      const priority = details.priority || "Medium";
      if (priority === "Critical") xpEarned = 70;
      else if (priority === "High") xpEarned = 50;
      else if (priority === "Medium") xpEarned = 30;
      else xpEarned = 20;

      const completeTaskAch = user.achievements.find(a => a.id === "complete_task");
      if (completeTaskAch && completeTaskAch.progress < completeTaskAch.maxProgress) {
        completeTaskAch.progress += 1;
      }

      const complete5TasksAch = user.achievements.find(a => a.id === "complete_5_tasks");
      if (complete5TasksAch && complete5TasksAch.progress < complete5TasksAch.maxProgress) {
        complete5TasksAch.progress += 1;
      }

      const complete15TasksAch = user.achievements.find(a => a.id === "complete_15_tasks");
      if (complete15TasksAch && complete15TasksAch.progress < complete15TasksAch.maxProgress) {
        complete15TasksAch.progress += 1;
      }

      if (priority === "High" || priority === "Critical") {
        const highPriorityAch = user.achievements.find(a => a.id === "high_priority");
        if (highPriorityAch && highPriorityAch.progress < highPriorityAch.maxProgress) {
          highPriorityAch.progress += 1;
        }
      }
    } 
    else if (actionType === "UNCOMPLETE_TASK") {
      const priority = details.priority || "Medium";
      if (priority === "Critical") xpEarned = -70;
      else if (priority === "High") xpEarned = -50;
      else if (priority === "Medium") xpEarned = -30;
      else xpEarned = -20;

      const completeTaskAch = user.achievements.find(a => a.id === "complete_task");
      if (completeTaskAch && !completeTaskAch.completed && completeTaskAch.progress > 0) {
        completeTaskAch.progress -= 1;
      }

      const complete5TasksAch = user.achievements.find(a => a.id === "complete_5_tasks");
      if (complete5TasksAch && !complete5TasksAch.completed && complete5TasksAch.progress > 0) {
        complete5TasksAch.progress -= 1;
      }

      const complete15TasksAch = user.achievements.find(a => a.id === "complete_15_tasks");
      if (complete15TasksAch && !complete15TasksAch.completed && complete15TasksAch.progress > 0) {
        complete15TasksAch.progress -= 1;
      }

      if (priority === "High") {
        const highPriorityAch = user.achievements.find(a => a.id === "high_priority");
        if (highPriorityAch && !highPriorityAch.completed && highPriorityAch.progress > 0) {
          highPriorityAch.progress -= 1;
        }
      }
    }

    user.xp = Math.max(0, user.xp + xpEarned);
    user.level = Math.floor(user.xp / 100) + 1;

    checkAchievements(user);

    user.markModified("achievements");
    await user.save();
  } catch (err) {
    console.error("Error rewarding XP:", err);
  }
};
