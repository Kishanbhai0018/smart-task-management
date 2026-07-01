const Task = require("../models/Task");
const User = require("../models/User");
const { rewardXP } = require("../controllers/gamificationController");

// Helper: Fuzzy match task by title for the current user
async function findTaskByTitle(userId, title) {
  if (!title) return null;

  // 1. Try exact or substring match first
  let task = await Task.findOne({
    user: userId,
    title: { $regex: title, $options: "i" },
    archived: { $ne: true }
  });
  if (task) return task;

  // 2. Split title into words and try to match tasks containing those words (ignoring common noise words)
  const noiseWords = ["task", "project", "my", "the", "for", "and", "a", "an", "to", "in", "on", "at", "by", "with", "it"];
  const words = title.split(/\s+/).filter(w => w.length > 2 && !noiseWords.includes(w.toLowerCase()));
  if (words.length > 0) {
    // Sort words by length descending to match the most specific term first
    words.sort((a, b) => b.length - a.length);
    for (const word of words) {
      task = await Task.findOne({
        user: userId,
        title: { $regex: word, $options: "i" },
        archived: { $ne: true }
      });
      if (task) return task;
    }
  }
  return null;
}

/**
 * Retrieve tasks based on filters.
 */
async function getTasks(userId, filters = {}) {
  const query = { user: userId, archived: { $ne: true } };
  const { statusFilter, priorityFilter, categoryFilter, timeFilter, searchQuery } = filters;

  if (statusFilter && statusFilter !== "All") {
    if (statusFilter === "Pending") {
      query.status = { $ne: "Completed" };
    } else {
      query.status = statusFilter;
    }
  }

  if (priorityFilter && priorityFilter !== "All") {
    query.priority = priorityFilter;
  }

  if (categoryFilter && categoryFilter !== "All") {
    query.category = categoryFilter;
  }

  if (searchQuery) {
    query.title = { $regex: searchQuery, $options: "i" };
  }

  // Handle smart relative date filters
  if (timeFilter && timeFilter !== "All") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (timeFilter.toLowerCase() === "today") {
      query.dueDate = { $gte: todayStart, $lte: todayEnd };
    } else if (timeFilter.toLowerCase() === "tomorrow") {
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      const tomorrowEnd = new Date(todayEnd);
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
      query.dueDate = { $gte: tomorrowStart, $lte: tomorrowEnd };
    } else if (timeFilter.toLowerCase() === "overdue") {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: "Completed" };
    } else if (timeFilter.toLowerCase() === "week") {
      const weekEnd = new Date(todayEnd);
      weekEnd.setDate(weekEnd.getDate() + 7);
      query.dueDate = { $gte: todayStart, $lte: weekEnd };
    }
  }

  return await Task.find(query).sort({ dueDate: 1 }).limit(30);
}

/**
 * Create a new task.
 */
async function createTask(userId, data) {
  const { title, dueDate, priority, description, category, project, estimatedTime, subtasks } = data;

  if (!title) {
    throw new Error("Task title is required.");
  }

  if (dueDate && new Date(dueDate) < new Date()) {
    throw new Error("Past dates are not allowed for task due dates.");
  }

  const mappedSubtasks = subtasks ? subtasks.map(s => {
    if (typeof s === "string") return { title: s, status: "Todo" };
    return { title: s.title || "", status: s.status || "Todo" };
  }) : [];

  const task = await Task.create({
    user: userId,
    title,
    dueDate,
    priority: priority || "Medium",
    description: description || "",
    category: category || "Personal",
    project: project || "General",
    estimatedTime: estimatedTime || 0,
    subtasks: mappedSubtasks
  });

  // Reward XP for creating task
  await rewardXP(userId, "CREATE_TASK");

  return task;
}

/**
 * Update an existing task.
 */
async function updateTask(userId, searchTitle, updates) {
  const task = await findTaskByTitle(userId, searchTitle);
  if (!task) {
    throw new Error(`No task found matching the title "${searchTitle}".`);
  }

  if (updates.dueDate && new Date(updates.dueDate) < new Date()) {
    throw new Error("Past dates are not allowed for task due dates.");
  }

  const originalStatus = task.status;
  const dbUpdates = {};

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.dueDate !== undefined) dbUpdates.dueDate = updates.dueDate;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.estimatedTime !== undefined) dbUpdates.estimatedTime = updates.estimatedTime;
  if (updates.actualTime !== undefined) dbUpdates.actualTime = updates.actualTime;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.project !== undefined) dbUpdates.project = updates.project;
  
  if (updates.subtasks !== undefined) {
    dbUpdates.subtasks = updates.subtasks.map(s => {
      if (typeof s === "string") return { title: s, status: "Todo" };
      return { title: s.title || "", status: s.status || "Todo" };
    });
  }

  const updatedTask = await Task.findByIdAndUpdate(
    task._id,
    { $set: dbUpdates },
    { new: true }
  );

  // Trigger gamification rewards if completion status changes
  if (updates.status && updates.status !== originalStatus) {
    if (updates.status === "Completed") {
      await rewardXP(userId, "COMPLETE_TASK", { priority: updatedTask.priority });
    } else if (originalStatus === "Completed") {
      await rewardXP(userId, "UNCOMPLETE_TASK", { priority: updatedTask.priority });
    }
  }

  return updatedTask;
}

/**
 * Delete a task.
 */
async function deleteTask(userId, searchTitle) {
  const task = await findTaskByTitle(userId, searchTitle);
  if (!task) {
    throw new Error(`No task found matching the title "${searchTitle}".`);
  }

  await Task.findByIdAndDelete(task._id);

  if (task.status === "Completed") {
    await rewardXP(userId, "UNCOMPLETE_TASK", { priority: task.priority });
  }

  return task;
}

/**
 * Fetch stats, metrics, and progress for user analytics.
 */
async function getUserStats(userId) {
  const userProfile = await User.findById(userId);
  const tasks = await Task.find({ user: userId, archived: { $ne: true } });

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = tasks.filter(t => t.status !== "Completed").length;
  const overdue = tasks.filter(t => t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < new Date()).length;

  // Find most important task (Not completed, sorted by priority High/Critical, then earliest dueDate)
  const priorityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
  const incompleteTasks = tasks.filter(t => t.status !== "Completed");
  incompleteTasks.sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || 0;
    const priorityB = priorityOrder[b.priority] || 0;
    if (priorityB !== priorityA) {
      return priorityB - priorityA; // Higher priority first
    }
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate); // Earlier due date first
  });
  const mostImportantTask = incompleteTasks[0] || null;

  // Average estimated completion time
  const estimatedTimes = tasks.map(t => t.estimatedTime || 0).filter(time => time > 0);
  const averageEstimatedTime = estimatedTimes.length > 0 
    ? (estimatedTimes.reduce((sum, time) => sum + time, 0) / estimatedTimes.length).toFixed(1)
    : 0;

  return {
    level: userProfile?.level || 1,
    xp: userProfile?.xp || 0,
    productivityScore: userProfile?.productivityScore || 70,
    tasksCount: {
      total,
      completed,
      pending,
      overdue
    },
    averageEstimatedTime,
    mostImportantTask: mostImportantTask ? {
      title: mostImportantTask.title,
      priority: mostImportantTask.priority,
      dueDate: mostImportantTask.dueDate
    } : null
  };
}

module.exports = {
  findTaskByTitle,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getUserStats
};
