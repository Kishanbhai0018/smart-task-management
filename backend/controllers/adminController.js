const User = require("../models/User");
const Task = require("../models/Task");

const checkAdmin = async (userId) => {
  const user = await User.findById(userId);
  return user && user.role === "Admin";
};

exports.getUsers = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, message: "User role updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    await User.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ user: req.params.id });
    res.json({ success: true, message: "User and their tasks deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGlobalStats = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "Completed" });
    const pendingTasks = totalTasks - completedTasks;

    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.backupTasks = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    const tasks = await Task.find({});
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.restoreTasks = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: "Invalid backup format" });
    }

    await Task.deleteMany({});
    await Task.insertMany(tasks);

    res.json({ success: true, message: "Tasks successfully restored from backup file" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
