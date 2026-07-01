const groq = require("../config/grok");

/**
 * Classify user intent and extract entities using Groq LLM.
 * @param {string} message The latest user message.
 * @param {Array} history Array of previous messages in { role, message } format.
 * @param {string} localTime ISO string representing user's current date/time.
 */
async function detectIntent(message, history = [], localTime = new Date().toISOString()) {
  const systemPrompt = `You are the Intent Detection engine for SmartTask AI (a MERN Smart Task Management assistant).
Your job is to analyze the user's latest query, resolve references (like "it" or "that task") using the chat history, and output a structured JSON containing the classified intent and extracted entities.

Current Date/Time Context (use this to resolve relative date terms like "tomorrow", "tonight", "next Wednesday", "tomorrow at 6 PM"):
${localTime}

Intents:
- CREATE_TASK: Create a new task (e.g. "Add a task to write report", "Create React task tomorrow").
- UPDATE_TASK: Update attributes of an existing task (e.g. "complete task", "change React priority to High", "reschedule homework to Friday").
- DELETE_TASK: Delete a task (e.g. "Delete task DBMS", "Remove it").
- GET_TASKS: Query, list, search, or filter tasks (e.g. "show pending tasks", "what is due tomorrow", "search for Java project", "overdue tasks").
- ANALYTICS: Ask about stats, score, productivity, completed tasks count, reports (e.g. "How productive am I?", "what is my productivity score?", "how many tasks did I complete?").
- AI_PLANNER: Planning daily/weekly schedules, breaking tasks into subtasks, suggesting priorities or estimating times (e.g. "Plan my day", "Suggest priority for React Project", "Break homework into subtasks", "Plan my week").
- GENERAL_AI: General chit-chat, motivation, general productivity advice (e.g. "Give me motivation", "How do I avoid procrastination?").

You MUST respond ONLY with a valid JSON object matching this structure:
{
  "intent": "CREATE_TASK" | "UPDATE_TASK" | "DELETE_TASK" | "GET_TASKS" | "ANALYTICS" | "AI_PLANNER" | "GENERAL_AI",
  "entities": {
    "title": "string (the task title to create, update, delete, or search. If referencing a previous task via 'it' or 'that', resolve it from chat history)",
    "dueDate": "string (resolved ISO 8601 absolute datetime, e.g. '2026-07-01T18:00:00Z')",
    "priority": "Low" | "Medium" | "High" | "Critical",
    "status": "Todo" | "In Progress" | "Review" | "Completed",
    "description": "string",
    "category": "string (e.g. Personal, Work, Education, Health, etc.)",
    "project": "string (e.g. General, ProjectName)",
    "estimatedTime": number (in hours),
    "subtasks": ["string"],
    
    // filters for GET_TASKS:
    "statusFilter": "Todo" | "In Progress" | "Review" | "Completed" | "Overdue" | "Pending" | "All",
    "priorityFilter": "Low" | "Medium" | "High" | "Critical" | "All",
    "categoryFilter": "string",
    "timeFilter": "Today" | "Tomorrow" | "Overdue" | "Week" | "All",
    
    // for AI_PLANNER:
    "plannerType": "day" | "week" | "prioritySuggest" | "subtaskBreakdown" | "timeEstimation",
    "targetTask": "string (the title of the task to suggest priority / subtasks / estimate for)"
  }
}

Rules:
1. Do not output anything outside the JSON object.
2. Resolve relative time using the context date: "${localTime}".
3. Resolve coreferences: If the user says "Delete it" or "Mark it complete", check the history to find the task title they were just talking about, and set "title" in entities to that task's title.
`;

  const apiMessages = [
    { role: "system", content: systemPrompt }
  ];

  // Map history format: client format has sender ("user" or "bot")
  history.forEach(h => {
    apiMessages.push({
      role: h.sender === "user" ? "user" : "assistant",
      content: h.text
    });
  });

  // Append user's latest query
  apiMessages.push({
    role: "user",
    content: message
  });

  try {
    const completion = await groq.createChatCompletionWithFallback({
      model: "llama-3.3-70b-versatile",
      messages: apiMessages,
      response_format: { type: "json_object" },
      temperature: 0.1 // Keep it deterministic
    });

    const output = completion.choices[0].message.content;
    const parsed = JSON.parse(output);
    return parsed;
  } catch (error) {
    console.error("Intent Service Error:", error);
    // Safe fallback if LLM classification fails
    return {
      intent: "GENERAL_AI",
      entities: {}
    };
  }
}

module.exports = {
  detectIntent
};
