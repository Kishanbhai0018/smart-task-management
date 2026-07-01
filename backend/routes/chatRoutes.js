const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { handleChat, getChatHistory, clearChatHistory } = require("../controllers/chatController");

router.use(protect);
router.post("/", handleChat);
router.get("/history", getChatHistory);
router.delete("/history", clearChatHistory);

module.exports = router;
