const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
  status: { type: String, enum: ["Todo", "In Progress", "Review", "Completed", "Overdue"], default: "Todo" },
  dueDate: { type: Date },
  startDate: { type: Date },
  endDate: { type: Date },
  category: { type: String, default: "Personal" },
  project: { type: String, default: "General" },
  tags: [{ type: String }],
  estimatedTime: { type: Number, default: 0 }, // in hours
  actualTime: { type: Number, default: 0 }, // in hours
  checklists: [{
    text: { type: String, required: true },
    done: { type: Boolean, default: false }
  }],
  subtasks: [{
    title: { type: String, required: true },
    status: { type: String, enum: ["Todo", "In Progress", "Review", "Completed"], default: "Todo" }
  }],
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  archived: { type: Boolean, default: false },
  recurrence: { type: String, enum: ["None", "Daily", "Weekly", "Monthly"], default: "None" }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
