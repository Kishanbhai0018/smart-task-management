import { useState, useRef, useEffect } from "react";
import { FiX, FiSend, FiZap, FiCheckCircle, FiClock, FiGrid, FiActivity, FiTrash2 } from "react-icons/fi";
import api from "../api/axiosInstance";
import "./Chatbot.css";

const Chatbot = ({ fetchTasks, fetchGamificationData, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your SmartTask AI Assistant. 🚀\n\nHow can I help you manage your tasks today? You can ask me to plan your day, suggest task priorities, break down large tasks, or display your productivity stats!",
      time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      isInitial: true
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState("planner"); // "tasks" | "planner" | "analytics"

  const messagesEndRef = useRef(null);

  // Helper: Fetch chat history from the MongoDB server (triggered on demand)
  const fetchChatHistory = async () => {
    if (!user) return;
    try {
      const res = await api.get("/chat/history");
      if (res.data && res.data.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch chat history from server:", err);
    }
  };

  // Helper: Clear chat history from MongoDB and reset messages state
  const clearChatHistory = async () => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to clear your chat history?")) return;
    try {
      await api.delete("/chat/history");
      setMessages([
        {
          sender: "bot",
          text: "Hello! I am your SmartTask AI Assistant. 🚀\n\nHow can I help you manage your tasks today? You can ask me to plan your day, suggest task priorities, break down large tasks, or display your productivity stats!",
          time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
          isInitial: true
        }
      ]);
    } catch (err) {
      console.error("Failed to clear chat history:", err);
      alert("Failed to clear chat history.");
    }
  };

  // Reset to a new fresh chat session on user log in / log out / page load
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: "Hello! I am your SmartTask AI Assistant. 🚀\n\nHow can I help you manage your tasks today? You can ask me to plan your day, suggest task priorities, break down large tasks, or display your productivity stats!",
        time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
        isInitial: true
      }
    ]);
  }, [user]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, showSuggestions]);

  const handleSendMessage = async (textToSend) => {
    const userMessage = textToSend.trim();
    if (!userMessage) return;

    // Add user message to state
    const now = new Date();
    const timeStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    
    const newMessages = [...messages, { sender: "user", text: userMessage, time: timeStr }];
    setMessages(newMessages);
    setInputValue("");
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      // Send history and current message to backend chat endpoint
      const response = await api.post("/chat", {
        message: userMessage,
        localTime: now.toISOString() // send current local time to resolve relative dates
      });

      // Add bot response
      const botTimeStr = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.data.message, time: botTimeStr }
      ]);

      // If backend reports an action was taken (task created, updated, or deleted), refresh frontend
      if (response.data.actionPerformed) {
        if (fetchTasks) fetchTasks();
        if (fetchGamificationData) fetchGamificationData();
      }
    } catch (err) {
      console.error("Chatbot API Error:", err);
      const errTimeStr = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am having trouble connecting to my servers right now. Please try again in a moment.",
          time: errTimeStr
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    handleSendMessage(suggestionText);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage(inputValue);
    }
  };

  // Robust client-side markdown formatter for headers, lists, code, and bold styling
  const renderMessageText = (text) => {
    if (!text) return "";
    
    const lines = text.split("\n");
    let inList = false;
    const listItems = [];
    const renderedElements = [];

    const parseInlineStyles = (txt) => {
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const codeRegex = /`([^`]+)`/g;
      
      let parts = [txt];
      
      // Parse inline code blocks first
      parts = parts.flatMap(part => {
        if (typeof part !== 'string') return part;
        const subparts = part.split(codeRegex);
        return subparts.map((sub, idx) => idx % 2 === 1 ? <code className="chatbot-inline-code" key={`code-${idx}`}>{sub}</code> : sub);
      });

      // Parse bold marks next
      parts = parts.flatMap((part, partIdx) => {
        if (typeof part !== 'string') return part;
        const subparts = part.split(boldRegex);
        return subparts.map((sub, idx) => idx % 2 === 1 ? <strong key={`bold-${partIdx}-${idx}`}>{sub}</strong> : sub);
      });

      return parts;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith("###")) {
        if (inList) {
          renderedElements.push(<ul key={`list-${index}`} className="chatbot-msg-list">{[...listItems]}</ul>);
          listItems.length = 0;
          inList = false;
        }
        renderedElements.push(<h5 key={`h3-${index}`} className="chatbot-msg-h5">{parseInlineStyles(trimmed.slice(3).trim())}</h5>);
      } else if (trimmed.startsWith("##")) {
        if (inList) {
          renderedElements.push(<ul key={`list-${index}`} className="chatbot-msg-list">{[...listItems]}</ul>);
          listItems.length = 0;
          inList = false;
        }
        renderedElements.push(<h4 key={`h2-${index}`} className="chatbot-msg-h4">{parseInlineStyles(trimmed.slice(2).trim())}</h4>);
      } else if (trimmed.startsWith("#")) {
        if (inList) {
          renderedElements.push(<ul key={`list-${index}`} className="chatbot-msg-list">{[...listItems]}</ul>);
          listItems.length = 0;
          inList = false;
        }
        renderedElements.push(<h3 key={`h1-${index}`} className="chatbot-msg-h3">{parseInlineStyles(trimmed.slice(1).trim())}</h3>);
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
        inList = true;
        const listContent = trimmed.replace(/^[-*•]\s*/, "");
        listItems.push(<li key={`li-${index}-${listItems.length}`} className="chatbot-msg-li">{parseInlineStyles(listContent)}</li>);
      } else {
        if (inList) {
          renderedElements.push(<ul key={`list-${index}`} className="chatbot-msg-list">{[...listItems]}</ul>);
          listItems.length = 0;
          inList = false;
        }
        if (trimmed.length > 0) {
          renderedElements.push(<p key={`p-${index}`} className="chatbot-msg-p">{parseInlineStyles(trimmed)}</p>);
        } else {
          renderedElements.push(<div key={`br-${index}`} style={{ height: "8px" }} />);
        }
      }
    });

    if (inList) {
      renderedElements.push(<ul key={`list-end`} className="chatbot-msg-list">{listItems}</ul>);
    }

    return renderedElements;
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        className={`chatbot-toggle-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Ask AI"
        id="chatbot-toggle-btn"
      >
        {isOpen ? (
          <FiX style={{ fontSize: "20px" }} />
        ) : (
          <>
            <span className="chatbot-toggle-pulse">🤖</span>
            <span>Ask AI</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container" id="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar-pulse">
                <FiZap style={{ fontSize: "16px", color: "#ffffff" }} />
              </div>
              <div className="chatbot-title-group">
                <h4>🤖 SmartTask AI</h4>
                <div className="chatbot-status">Online</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button 
                className="chatbot-header-btn" 
                onClick={fetchChatHistory}
                title="Load past chat history"
              >
                <FiClock style={{ fontSize: "16px" }} />
              </button>
              <button 
                className="chatbot-header-btn chatbot-delete-btn" 
                onClick={clearChatHistory}
                title="Clear chat history"
              >
                <FiTrash2 style={{ fontSize: "16px" }} />
              </button>
              <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                <FiX style={{ fontSize: "18px" }} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-msg ${msg.sender}`}>
                <div className="chat-msg-bubble">
                  {renderMessageText(msg.text)}

                  {/* Show initial greeting command hints */}
                  {msg.isInitial && messages.length === 1 && (
                    <div className="chatbot-suggestions">
                      <div className="chatbot-suggestions-title">💡 Quick Starters</div>
                      <div className="chatbot-suggestions-grid">
                        <button 
                          className="chatbot-chip" 
                          onClick={() => handleSuggestionClick("Show my pending tasks")}
                        >
                          <FiCheckCircle className="chatbot-chip-icon" />
                          <span>Show pending tasks</span>
                        </button>
                        <button 
                          className="chatbot-chip" 
                          onClick={() => handleSuggestionClick("Plan my day")}
                        >
                          <FiZap className="chatbot-chip-icon" />
                          <span>AI Daily Planner</span>
                        </button>
                        <button 
                          className="chatbot-chip" 
                          onClick={() => handleSuggestionClick("How productive am I?")}
                        >
                          <FiActivity className="chatbot-chip-icon" />
                          <span>Productivity Score</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <span className="chat-msg-time">{msg.time}</span>
              </div>
            ))}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="chat-msg bot">
                <div className="chat-msg-bubble" style={{ padding: "10px 14px" }}>
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Categorized Suggestions Drawer */}
          {showSuggestions && (
            <div className="chatbot-suggestions-drawer animate-slide-up">
              <div className="chatbot-suggestions-drawer-header">
                <span>⚡ AI Smart Commands</span>
                <button className="chatbot-suggestions-close-btn" onClick={() => setShowSuggestions(false)}>
                  <FiX />
                </button>
              </div>
              
              <div className="chatbot-suggestions-tabs">
                <button 
                  className={`chatbot-tab-btn ${activeTab === "planner" ? "active" : ""}`}
                  onClick={() => setActiveTab("planner")}
                >
                  Planner
                </button>
                <button 
                  className={`chatbot-tab-btn ${activeTab === "tasks" ? "active" : ""}`}
                  onClick={() => setActiveTab("tasks")}
                >
                  Tasks
                </button>
                <button 
                  className={`chatbot-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
                  onClick={() => setActiveTab("analytics")}
                >
                  Analytics
                </button>
              </div>

              <div className="chatbot-suggestions-content">
                {activeTab === "planner" && (
                  <div className="chatbot-suggestions-list">
                    <button onClick={() => handleSuggestionClick("Plan my day")}>☀️ AI Daily Planner</button>
                    <button onClick={() => handleSuggestionClick("Plan my week")}>📅 AI Weekly Planner</button>
                    <button onClick={() => handleSuggestionClick("Suggest priority for my most important task")}>⚡ Suggest Task Priorities</button>
                    <button onClick={() => handleSuggestionClick("Break down my most important task into subtasks")}>🧩 Break Task into Subtasks</button>
                  </div>
                )}
                {activeTab === "tasks" && (
                  <div className="chatbot-suggestions-list">
                    <button onClick={() => handleSuggestionClick("Show my pending tasks")}>📋 Show Pending Tasks</button>
                    <button onClick={() => handleSuggestionClick("Show overdue tasks")}>⚠️ Show Overdue Tasks</button>
                    <button onClick={() => handleSuggestionClick("Create task: Study React Project tomorrow at 6 PM")}>➕ Create task: Study React Project tomorrow</button>
                    <button onClick={() => handleSuggestionClick("Search for my React Project task")}>🔍 Search for React Project</button>
                  </div>
                )}
                {activeTab === "analytics" && (
                  <div className="chatbot-suggestions-list">
                    <button onClick={() => handleSuggestionClick("How productive am I?")}>📈 Productivity Analytics & Score</button>
                    <button onClick={() => handleSuggestionClick("How many tasks are completed?")}>🏆 Task Completion Rate</button>
                    <button onClick={() => handleSuggestionClick("Give me productivity advice to reduce workload")}>💡 Workload Reduction Advice</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="chatbot-footer">
            <div className="chatbot-input-container">
              <button 
                className={`chatbot-drawer-toggle-btn ${showSuggestions ? "active" : ""}`}
                onClick={() => {
                  setShowSuggestions(!showSuggestions);
                  if(!showSuggestions) {
                    setActiveTab("planner"); // Default tab when opening
                  }
                }}
                title="Toggle AI commands list"
              >
                <FiGrid style={{ fontSize: "16px" }} />
              </button>
              <input
                type="text"
                className="chatbot-input"
                placeholder="Ask me to plan your day, create tasks..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
              />
              <button 
                className="chatbot-send-btn"
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
              >
                <FiSend style={{ fontSize: "14px" }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
