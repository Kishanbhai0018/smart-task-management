const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { 
  getUsers, 
  updateUserRole, 
  deleteUser, 
  getGlobalStats, 
  backupTasks, 
  restoreTasks 
} = require("../controllers/adminController");

router.use(protect);
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/stats", getGlobalStats);
router.get("/backup", backupTasks);
router.post("/restore", restoreTasks);

module.exports = router;
