const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getUserStats, getLeaderboard } = require("../controllers/gamificationController");

router.use(protect);
router.get("/status", getUserStats);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
