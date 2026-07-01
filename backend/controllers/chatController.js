const ChatHistory = require("../models/ChatHistory");
const intentService = require("../services/intentService");
const taskService = require("../services/taskService");
const aiService = require("../services/aiService");

// Helper: Save chat message to database
async function saveChatMessage(userId, role, text) {
  try {
    await ChatHistory.create({
      user: userId,
      role: role,
      message: text
    });
  } catch (e) {
    console.error("Failed to save chat message in DB:", e);
  }
}

// Orchestrating controller for chatbot interactions
exports.handleChat = async (req, res) => {
  try {
    const { message, localTime } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const userId = req.user;

    // 1. Save user query to history database
    await saveChatMessage(userId, "user", message);

    // 2. Retrieve recent history (last 10 messages)
    const historyDocs = await ChatHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);
      
    // Reverse to get chronological order and map to `{ sender, text }`
    const mappedHistory = historyDocs.reverse().map(h => ({
      sender: h.role === "user" ? "user" : "bot",
      text: h.message
    }));

    // 3. Run Intent Detection Service to classify intent and extract arguments
    const { intent, entities } = await intentService.detectIntent(message, mappedHistory, localTime);
    console.log(`[SmartTask AI] Detected Intent: ${intent} | Entities:`, entities);

    let actionResult = null;
    let actionPerformed = false;

    // 4. Dispatch database operation based on intent
    try {
      if (intent === "CREATE_TASK") {
        if (!entities.title) {
          actionResult = { error: "Missing task title. Please specify a name for the task." };
        } else {
          const task = await taskService.createTask(userId, {
            title: entities.title,
            dueDate: entities.dueDate,
            priority: entities.priority,
            description: entities.description,
            category: entities.category,
            project: entities.project,
            estimatedTime: entities.estimatedTime,
            subtasks: entities.subtasks
          });
          actionResult = {
            success: true,
            action: "create",
            task: {
              title: task.title,
              dueDate: task.dueDate,
              priority: task.priority,
              status: task.status
            }
          };
          actionPerformed = true;
        }
      } else if (intent === "UPDATE_TASK") {
        // We need a title to search for the task to update
        if (!entities.title) {
          actionResult = { error: "I need the name of the task to update. Which task would you like to change?" };
        } else {
          // Clean empty or undefined entities so we don't overwrite with nulls
          const updates = {};
          if (entities.status !== undefined) updates.status = entities.status;
          if (entities.priority !== undefined) updates.priority = entities.priority;
          if (entities.dueDate !== undefined) updates.dueDate = entities.dueDate;
          if (entities.description !== undefined) updates.description = entities.description;
          if (entities.estimatedTime !== undefined) updates.estimatedTime = entities.estimatedTime;
          if (entities.category !== undefined) updates.category = entities.category;
          if (entities.project !== undefined) updates.project = entities.project;
          if (entities.subtasks !== undefined) updates.subtasks = entities.subtasks;

          if (Object.keys(updates).length === 0) {
            actionResult = { error: "No changes specified. What update would you like me to make?" };
          } else {
            const task = await taskService.updateTask(userId, entities.title, updates);
            actionResult = {
              success: true,
              action: "update",
              task: {
                title: task.title,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate
              }
            };
            actionPerformed = true;
          }
        }
      } else if (intent === "DELETE_TASK") {
        if (!entities.title) {
          actionResult = { error: "Please specify the title of the task you want to delete." };
        } else {
          const task = await taskService.deleteTask(userId, entities.title);
          actionResult = {
            success: true,
            action: "delete",
            taskTitle: task.title
          };
          actionPerformed = true;
        }
      } else if (intent === "GET_TASKS") {
        // If they specify filters in entities, we can fetch tasks with filters
        const filters = {
          statusFilter: entities.statusFilter,
          priorityFilter: entities.priorityFilter,
          categoryFilter: entities.categoryFilter,
          timeFilter: entities.timeFilter,
          searchQuery: entities.title
        };
        const filteredTasks = await taskService.getTasks(userId, filters);
        actionResult = {
          action: "list",
          filtersEvaluated: filters,
          count: filteredTasks.length
        };
      } else if (intent === "ANALYTICS") {
        actionResult = { action: "analytics" };
      } else if (intent === "AI_PLANNER") {
        actionResult = { 
          action: "planner", 
          plannerType: entities.plannerType,
          targetTask: entities.targetTask 
        };
      }
    } catch (err) {
      console.error(`Failed database action for intent ${intent}:`, err.message);
      actionResult = { error: err.message };
    }

    // 5. Retrieve latest live context (tasks and stats) to feed to AI
    const tasks = await taskService.getTasks(userId);
    const stats = await taskService.getUserStats(userId);

    // 6. Call AI Completion Service to generate natural response
    const reply = await aiService.generateResponse(
      message, 
      { tasks, stats, actionResult, localTime }, 
      mappedHistory
    );

    // 7. Save bot reply to history database
    await saveChatMessage(userId, "assistant", reply);

    // 8. Return response
    return res.json({
      message: reply,
      actionPerformed
    });

  } catch (err) {
    console.error("Chatbot Controller Error:", err);
    res.status(500).json({ message: "Chatbot encountered an error: " + err.message });
  }
};

// Get chat history endpoint for UI loading
exports.getChatHistory = async (req, res) => {
  try {
    const history = await ChatHistory.find({ user: req.user })
      .sort({ createdAt: -1 })
      .limit(20);
      
    const messages = history.reverse().map(h => ({
      sender: h.role === "user" ? "user" : "bot",
      text: h.message,
      time: new Date(h.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    }));
    
    res.json({ messages });
  } catch (err) {
    console.error("Failed to get chat history:", err);
    res.status(500).json({ message: "Failed to load chat history" });
  }
};

// Clear chat history endpoint
exports.clearChatHistory = async (req, res) => {
  try {
    await ChatHistory.deleteMany({ user: req.user });
    res.json({ message: "Chat history cleared successfully" });
  } catch (err) {
    console.error("Failed to clear chat history:", err);
    res.status(500).json({ message: "Failed to clear chat history" });
  }
};

