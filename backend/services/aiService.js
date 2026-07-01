const groq = require("../config/grok");

/**
 * Generate a natural language response for the user query using the SmartTask AI system prompt and context.
 * @param {string} query The latest user message.
 * @param {object} contextData Object containing live database tasks, user stats, and results of any performed actions.
 * @param {Array} history Conversation history.
 */
async function generateResponse(query, contextData = {}, history = []) {
  const { tasks, stats, actionResult, localTime } = contextData;

  // Format the tasks and stats context for the AI model
  const liveTasksContext = tasks && tasks.length > 0
    ? tasks.map(t => `- **${t.title}** | Status: ${t.status} | Priority: ${t.priority} | Due: ${t.dueDate ? new Date(t.dueDate).toLocaleString() : "None"} | Category: ${t.category} | Project: ${t.project}`).join("\n")
    : "No tasks found.";

  const userStatsContext = stats
    ? `- Level: ${stats.level}
- XP: ${stats.xp}
- Productivity Score: ${stats.productivityScore}
- Total Tasks: ${stats.tasksCount?.total || 0}
- Completed Tasks: ${stats.tasksCount?.completed || 0}
- Pending Tasks: ${stats.tasksCount?.pending || 0}
- Overdue Tasks: ${stats.tasksCount?.overdue || 0}
- Average Estimated Duration per Task: ${stats.averageEstimatedTime || 0} hours
- Most Important Task: ${stats.mostImportantTask ? `**${stats.mostImportantTask.title}** (Priority: ${stats.mostImportantTask.priority}, Due: ${new Date(stats.mostImportantTask.dueDate).toLocaleString()})` : "None"}`
    : "No user stats available.";

  const actionContext = actionResult
    ? `[ACTION EXECUTED] The system just performed the following operation: ${JSON.stringify(actionResult)}`
    : "[ACTION EXECUTED] No database operation was performed for this turn.";

  const systemPrompt = `You are SmartTask AI, an intelligent MERN-stack task management assistant.

Abilities:
- Create tasks
- Update tasks
- Delete tasks
- Search tasks
- Recommend priorities
- Break large tasks into subtasks
- Estimate completion time
- Suggest schedules (daily / weekly planner)
- Give productivity advice and analytics summaries

Rules:
1. **Never invent task information**. Only speak about tasks provided in the "Current Context".
2. **Only use task and profile data provided by the backend**.
3. **If information is missing to perform an action, ask for clarification**.
4. **Keep answers short, professional, and friendly**. Use emojis to make interactions engaging.
5. **Format replies beautifully using Markdown**: Bold task titles (e.g. **React Project**), create lists, and highlight statistics.

Current Context:
Current Date/Time: ${localTime || new Date().toISOString()}

User Productivity Profile:
${userStatsContext}

User's Live Tasks (MongoDB):
${liveTasksContext}

Database Action Result:
${actionContext}

Analyze the user's query. If an action was just executed, start by confirming the action (e.g. "✅ I have created your task...") and then provide any additional details, advice, or suggestions requested. If they are asking for schedules, reports, or advice, construct a detailed planner/report using the live tasks context.
`;

  const apiMessages = [
    { role: "system", content: systemPrompt }
  ];

  // Load history (converting from frontend structure if necessary)
  history.forEach(h => {
    apiMessages.push({
      role: h.sender === "user" ? "user" : "assistant",
      content: h.text
    });
  });

  // Append user's latest query
  apiMessages.push({
    role: "user",
    content: query
  });

  try {
    const completion = await groq.createChatCompletionWithFallback({
      model: "llama-3.3-70b-versatile",
      messages: apiMessages,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Service Completion Error:", error);
    return "I apologize, but I encountered an error generating a response. Please check your tasks directly in the dashboard.";
  }
}

module.exports = {
  generateResponse
};
