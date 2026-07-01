const Task = require("../models/Task");
const { rewardXP } = require("./gamificationController");

exports.getTasks = async (req, res) => {
  try {
    // Auto overdue check: find all tasks where dueDate is in the past and status is not Completed
    await Task.updateMany(
      {
        user: req.user,
        status: { $nin: ["Completed", "Overdue"] },
        dueDate: { $lt: new Date() }
      },
      { $set: { status: "Overdue" } }
    );

    const filter = { user: req.user };

    // Default to unarchived unless queried
    if (req.query.archived === "true") {
      filter.archived = true;
    } else {
      filter.archived = { $ne: true };
    }

    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }
    if (req.query.project && req.query.project !== "All") {
      filter.project = req.query.project;
    }
    if (req.query.priority && req.query.priority !== "All") {
      filter.priority = req.query.priority;
    }
    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status;
    }

    const tasks = await Task.find(filter).populate("dependencies");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { 
      title, description, priority, status, dueDate, startDate, endDate,
      category, project, tags, estimatedTime, actualTime, checklists, subtasks,
      dependencies, recurrence
    } = req.body;

    if (dueDate) {
      if (new Date(dueDate) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Past dates are not allowed."
        });
      }
    }

    const task = await Task.create({
      user: req.user,
      title,
      description,
      priority: priority || "Medium",
      status: status || "Todo",
      dueDate,
      startDate,
      endDate,
      category: category || "Personal",
      project: project || "General",
      tags: tags || [],
      estimatedTime: estimatedTime || 0,
      actualTime: actualTime || 0,
      checklists: checklists || [],
      subtasks: subtasks || [],
      dependencies: dependencies || [],
      recurrence: recurrence || "None"
    });

    await rewardXP(req.user, "CREATE_TASK");
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const originalTask = await Task.findOne({ _id: req.params.id, user: req.user });
    if (!originalTask) return res.status(404).json({ message: "Task not found" });

    if (req.body.dueDate) {
      const originalDueDate = originalTask.dueDate ? new Date(originalTask.dueDate).getTime() : null;
      const newDueDate = new Date(req.body.dueDate).getTime();
      
      if (newDueDate !== originalDueDate && new Date(req.body.dueDate) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Past dates are not allowed."
        });
      }
    }

    // Handle status change XP reward hooks
    const statusChanged = req.body.status && req.body.status !== originalTask.status;
    const priority = req.body.priority || originalTask.priority;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      req.body,
      { new: true }
    ).populate("dependencies");

    if (statusChanged) {
      if (task.status === "Completed") {
        await rewardXP(req.user, "COMPLETE_TASK", { priority });
      } else if (originalTask.status === "Completed") {
        await rewardXP(req.user, "UNCOMPLETE_TASK", { priority });
      }
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.status === "Completed") {
      await rewardXP(req.user, "UNCOMPLETE_TASK", { priority: task.priority });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.duplicateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const duplicated = await Task.create({
      user: req.user,
      title: `${task.title} (Copy)`,
      description: task.description,
      priority: task.priority,
      status: "Todo", // Reset to initial state
      dueDate: task.dueDate,
      startDate: task.startDate,
      endDate: task.endDate,
      category: task.category,
      project: task.project,
      tags: task.tags,
      estimatedTime: task.estimatedTime,
      actualTime: 0, // Reset actual time
      checklists: task.checklists.map(c => ({ text: c.text, done: false })), // Reset checklists
      subtasks: task.subtasks.map(s => ({ title: s.title, status: "Todo" })), // Reset subtasks
      dependencies: [], // Clear dependencies
      recurrence: task.recurrence
    });

    await rewardXP(req.user, "CREATE_TASK");
    res.status(201).json(duplicated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.archiveTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { archived: true },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ success: true, message: "Task archived successfully", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.restoreTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { archived: false },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ success: true, message: "Task restored successfully", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
