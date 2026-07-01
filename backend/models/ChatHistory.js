const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
