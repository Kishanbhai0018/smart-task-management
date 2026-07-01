const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  duplicateTask, 
  archiveTask, 
  restoreTask 
} = require("../controllers/taskController");

router.use(protect);
router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/duplicate", duplicateTask);
router.put("/:id/archive", archiveTask);
router.put("/:id/restore", restoreTask);

module.exports = router;
