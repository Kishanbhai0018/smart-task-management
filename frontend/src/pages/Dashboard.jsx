import { useEffect, useState, useContext } from "react";
import { 
  FiMenu, FiCheckSquare, FiCheckCircle, FiClock, FiAlertTriangle, FiBarChart2, 
  FiUser, FiPlus, FiChevronLeft, FiChevronRight, 
  FiInfo, FiDownload, FiSearch, FiActivity, FiEdit2, FiTrash2, FiMoon, 
  FiZap, FiAward, FiStar, FiArchive, FiUsers, FiUpload 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import ExportPDFModal from "../components/ExportPDFModal";
import Chatbot from "../components/Chatbot";
import { AuthContext } from "../context/AuthContext";


// Translation dictionary for Multi-language support
const dashboardTranslations = {
  English: {
    dashboardTitle: "Dashboard Overview",
    totalTasks: "Total Tasks",
    completedTasks: "Completed",
    pendingTasks: "Pending",
    overdueTasks: "Overdue",
    completionRate: "Completion Rate",
    upcomingDeadlines: "Upcoming Deadlines",
    quickAddTitle: "Quick Add Task",
    quickAddPlaceholder: "What needs to be done?",
    addBtn: "Add",
    manageTasks: "Manage Tasks",
    doneBtn: "Done",
    tasksWorkspace: "Task Workspace",
    createNewTask: "Create New Task",
    editTask: "Edit Task",
    titleLabel: "Title *",
    descLabel: "Description",
    priorityLabel: "Priority",
    statusLabel: "Status",
    categoryLabel: "Category",
    projectLabel: "Project",
    tagsLabel: "Tags",
    startDateLabel: "Start Date",
    endDateLabel: "End Date",
    estTimeLabel: "Est. Time (Hours)",
    actTimeLabel: "Act. Time (Hours)",
    saveBtn: "Save",
    cancelBtn: "Cancel",
    tasksList: "Tasks List",
    exportPDF: "Export PDF",
    allFilters: "All Status / Priorities",
    filterPlaceholder: "Filter tasks...",
    noTasksFound: "No tasks found matching current filters.",
    calendarSchedule: "Calendar Schedule",
    activityHistory: "Activity History",
    questBoard: "Quest Board & Leaderboard",
    accountSettings: "Account Settings",
    appPreferences: "Settings",
    adminControl: "Admin Control Panel",
    productivityScore: "Productivity Score",
    recentProjects: "Recent Projects",
    streak: "Daily Streak",
    level: "Level",
    saveChanges: "Save Changes",
    timezone: "Time Zone",
    language: "Language",
    emailNotif: "Email Notifications",
    browserNotif: "Browser Notifications",
    privacyPublic: "Leaderboard Public Visibility",
    backupRestore: "Backup & Restore Data",
    backupBtn: "Export Task Backup",
    restoreBtn: "Restore from File",
    adminPanel: "Admin Panel",
    usersList: "Registered Users",
    promote: "Promote",
    demote: "Demote",
    delete: "Delete",
    globalStats: "Global Statistics",
    analyticsDashboard: "Analytics Dashboard"
  },
  Spanish: {
    dashboardTitle: "Resumen del Panel",
    totalTasks: "Tareas Totales",
    completedTasks: "Completado",
    pendingTasks: "Pendiente",
    overdueTasks: "Atrasado",
    completionRate: "Tasa de Finalización",
    upcomingDeadlines: "Próximos Plazos",
    quickAddTitle: "Agregar Tarea Rápida",
    quickAddPlaceholder: "¿Qué hay que hacer?",
    addBtn: "Añadir",
    manageTasks: "Administrar Tareas",
    doneBtn: "Hecho",
    tasksWorkspace: "Espacio de Tareas",
    createNewTask: "Crear Nueva Tarea",
    editTask: "Editar Tarea",
    titleLabel: "Título *",
    descLabel: "Descripción",
    priorityLabel: "Prioridad",
    statusLabel: "Estado",
    categoryLabel: "Categoría",
    projectLabel: "Proyecto",
    tagsLabel: "Etiquetas",
    startDateLabel: "Fecha de Inicio",
    endDateLabel: "Fecha de Finalización",
    estTimeLabel: "Tiempo Est. (Horas)",
    actTimeLabel: "Tiempo Real (Horas)",
    saveBtn: "Guardar",
    cancelBtn: "Cancelar",
    tasksList: "Lista de Tareas",
    exportPDF: "Exportar PDF",
    allFilters: "Todos los Estados / Prioridades",
    filterPlaceholder: "Filtrar tareas...",
    noTasksFound: "No se encontraron tareas con los filtros actuales.",
    calendarSchedule: "Calendario de Horarios",
    activityHistory: "Historial de Actividades",
    questBoard: "Misiones y Tabla",
    accountSettings: "Configuración de Cuenta",
    appPreferences: "Configuración",
    adminControl: "Panel de Control Admin",
    productivityScore: "Puntaje de Productividad",
    recentProjects: "Proyectos Recientes",
    streak: "Racha Diaria",
    level: "Nivel",
    saveChanges: "Guardar Cambios",
    timezone: "Zona Horaria",
    language: "Idioma",
    emailNotif: "Notificaciones por Correo",
    browserNotif: "Notificaciones del Navegador",
    privacyPublic: "Visibilidad Pública en Tabla",
    backupRestore: "Copia de Seguridad y Restauración",
    backupBtn: "Exportar Copia",
    restoreBtn: "Restaurar de Archivo",
    adminPanel: "Panel Admin",
    usersList: "Usuarios Registrados",
    promote: "Promover",
    demote: "Degradar",
    delete: "Eliminar",
    globalStats: "Estadísticas Globales",
    analyticsDashboard: "Tablero de Analíticas"
  },
  Hindi: {
    dashboardTitle: "डैशबोर्ड अवलोकन",
    totalTasks: "कुल कार्य",
    completedTasks: "पूर्ण",
    pendingTasks: "लंबित",
    overdueTasks: "समय सीमा पार",
    completionRate: "पूर्णता दर",
    upcomingDeadlines: "आगामी समय सीमा",
    quickAddTitle: "त्वरित कार्य जोड़ें",
    quickAddPlaceholder: "क्या करने की आवश्यकता है?",
    addBtn: "जोड़ें",
    manageTasks: "कार्यों को प्रबंधित करें",
    doneBtn: "पूर्ण",
    tasksWorkspace: "कार्यस्थान",
    createNewTask: "नया कार्य बनाएं",
    editTask: "कार्य संपादित करें",
    titleLabel: "शीर्षक *",
    descLabel: "विवरण",
    priorityLabel: "प्राथमिकता",
    statusLabel: "स्थिति",
    categoryLabel: "श्रेणी",
    projectLabel: "परियोजना",
    tagsLabel: "टैग",
    startDateLabel: "प्रारंभ तिथि",
    endDateLabel: "अंतिम तिथि",
    estTimeLabel: "अनुमानित समय (घंटे)",
    actTimeLabel: "वास्तविक समय (घंटे)",
    saveBtn: "सहेजें",
    cancelBtn: "रद्द करें",
    tasksList: "कार्यों की सूची",
    exportPDF: "पीडीएफ निर्यात करें",
    allFilters: "सभी स्थिति / प्राथमिकताएं",
    filterPlaceholder: "कार्यों को फ़िल्टर करें...",
    noTasksFound: "वर्तमान फ़िल्टर से मेल खाने वाले कोई कार्य नहीं मिले।",
    calendarSchedule: "कैलेंडर अनुसूची",
    activityHistory: "गतिविधि इतिहास",
    questBoard: "खोज पट्ट और लीडरबोर्ड",
    accountSettings: "खाता सेटिंग्स",
    appPreferences: "सेटिंग्स",
    adminControl: "एडमिन नियंत्रण कक्ष",
    productivityScore: "उत्पादकता स्कोर",
    recentProjects: "हाल की परियोजनाएं",
    streak: "दैनिक सिलसिला",
    level: "स्तर",
    saveChanges: "बदलाव सहेजें",
    timezone: "समय क्षेत्र",
    language: "भाषा",
    emailNotif: "ईमेल सूचनाएं",
    browserNotif: "ब्राउज़र सूचनाएं",
    privacyPublic: "लीडरबोर्ड सार्वजनिक दृश्यता",
    backupRestore: "बैकअप और डेटा पुनर्स्थापना",
    backupBtn: "कार्य बैकअप निर्यात करें",
    restoreBtn: "फ़ाइल से पुनर्स्थापित करें",
    adminPanel: "एडमिन पैनल",
    usersList: "पंजीकृत उपयोगकर्ता",
    promote: "पदोन्नति",
    demote: "पद अवनति",
    delete: "हटाएं",
    globalStats: "वैश्विक आँकड़े",
    analyticsDashboard: "विश्लेषण डैशबोर्ड"
  }
};

// Custom high-end Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-label">{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="tooltip-value">
            <span 
              className="tooltip-dot" 
              style={{ backgroundColor: entry.color || entry.stroke || entry.fill || "#8b5cf6" }}
            ></span>
            <span className="text-muted">{entry.name}:</span>
            <strong style={{ color: "var(--dash-text-primary)" }}>{entry.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const formatDateTimeLocal = (dateVal) => {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const formatRelativeDate = (dateVal) => {
  if (!dateVal) return "";
  const now = new Date();
  const date = new Date(dateVal);
  
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = targetStart - todayStart;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const formatTime = (d) => {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  if (diffDays === 0) {
    return `Today at ${formatTime(date)}`;
  } else if (diffDays === 1) {
    return `Tomorrow at ${formatTime(date)}`;
  } else if (diffDays === 2) {
    return `In 2 Days at ${formatTime(date)}`;
  } else if (diffDays === 3) {
    return `In 3 Days at ${formatTime(date)}`;
  } else if (diffDays > 3 && diffDays <= 6) {
    return `In ${diffDays} Days at ${formatTime(date)}`;
  } else if (diffDays === 7) {
    return `Next Week at ${formatTime(date)}`;
  } else if (diffDays > 7) {
    return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} at ${formatTime(date)}`;
  } else {
    return "Overdue";
  }
};

const Dashboard = () => {
  const { user, logout, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Task & View filters
  const [tasks, setTasks] = useState([]);
  const [errorToast, setErrorToast] = useState("");
  const [activeTimer, setActiveTimer] = useState(() => {
    const savedId = localStorage.getItem("activeTimerTaskId");
    const savedStart = localStorage.getItem("activeTimerStartTime");
    const savedInitial = localStorage.getItem("activeTimerInitialTime");
    if (savedId && savedStart) {
      return { taskId: savedId, startTime: parseInt(savedStart), initialTime: parseFloat(savedInitial || "0") };
    }
    return null;
  });

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    JSON.parse(localStorage.getItem("sidebarCollapsed")) || false
  );
  
  // Gamification States
  const [gamificationStats, setGamificationStats] = useState({
    xp: 0,
    level: 1,
    badges: [],
    dailyStreak: 0,
    achievements: []
  });
  const [leaderboard, setLeaderboard] = useState([]);

  // Task Edit State
  const [editingTask, setEditingTask] = useState(null);

  // Profile States
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "9876543210");
  const [avatarIndex, setAvatarIndex] = useState(
    JSON.parse(localStorage.getItem("avatarIndex")) || 0
  );

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");

  // Dark Mode state
  const [isDark, setIsDark] = useState(
    JSON.parse(localStorage.getItem("isDark")) || false
  );

  // User Preference / Settings States
  const [language, setLanguage] = useState(user?.settings?.language || localStorage.getItem("language") || "English");
  const [timeZone, setTimeZone] = useState(user?.settings?.timeZone || "UTC");
  const [emailAlerts, setEmailAlerts] = useState(
    user?.settings?.emailNotifications !== false
  );
  const [browserAlerts, setBrowserAlerts] = useState(
    user?.settings?.browserNotifications !== false
  );
  const [privacyPublic, setPrivacyPublic] = useState(
    user?.settings?.privacyPublic !== false
  );

  // Quick Add State
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDueDate, setQuickDueDate] = useState("");
  const [quickPriority, setQuickPriority] = useState("Medium");
  const [quickCategory, setQuickCategory] = useState("Personal");

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [calendarView, setCalendarView] = useState("month"); // month, week, day, agenda

  // Admin States
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  // Show Archived Tab toggle
  const [showArchived, setShowArchived] = useState(false);

  // Activity feed logs
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem("activities");
    if (saved) return JSON.parse(saved);
    return [
      { id: "act-1", time: "10:15", desc: "User session authenticated successfully" },
      { id: "act-2", time: "10:20", desc: "Synced MERN database endpoints" }
    ];
  });

  // History Search & Filter State
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState("All");
  const [historyDateFilter] = useState("All");
  const [historyLimit] = useState(10);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const avatarPresets = [
    { emoji: "🧑‍💻", bg: "#7c3aed" },
    { emoji: "🦁", bg: "#f59e0b" },
    { emoji: "🦊", bg: "#ef4444" },
    { emoji: "🐼", bg: "#10b981" }
  ];

  const t = (key) => {
    return dashboardTranslations[language]?.[key] || dashboardTranslations["English"]?.[key] || key;
  };

  const fetchGamificationData = async () => {
    try {
      const statusRes = await api.get("/gamification/status");
      setGamificationStats(statusRes.data);
      
      const leaderboardRes = await api.get("/gamification/leaderboard");
      setLeaderboard(leaderboardRes.data);
    } catch (err) {
      console.error("Failed to fetch gamification data", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?archived=${showArchived}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const fetchAdminData = async () => {
    if (user?.role !== "Admin") return;
    try {
      const usersRes = await api.get("/admin/users");
      setAdminUsers(usersRes.data);
      const statsRes = await api.get("/admin/stats");
      setAdminStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch admin dashboard stats", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchGamificationData();
    if (user?.role === "Admin") {
      fetchAdminData();
    }
    
    // Request HTML5 notification permission
    if (window.Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  // Sync theme selection to body class name
  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [isDark]);

  // Sync profile details when user context loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "9876543210");
      if (user.settings) {
        setLanguage(user.settings.language || "English");
        setTimeZone(user.settings.timeZone || "UTC");
        setEmailAlerts(user.settings.emailNotifications !== false);
        setBrowserAlerts(user.settings.browserNotifications !== false);
        setPrivacyPublic(user.settings.privacyPublic !== false);
      }
    }
  }, [user]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem("isDark", JSON.stringify(nextDark));
    logActivity(`Theme changed to ${nextDark ? "Dark Mode" : "Light Mode"}`);
  };

  const logActivity = (desc) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
    const dateString = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    
    let category = "system";
    const lowerDesc = desc.toLowerCase();
    if (lowerDesc.includes("task") || lowerDesc.includes("created task") || lowerDesc.includes("updated task") || lowerDesc.includes("deleted task")) {
      category = "task";
    } else if (lowerDesc.includes("theme") || lowerDesc.includes("alert") || lowerDesc.includes("digest") || lowerDesc.includes("preferences")) {
      category = "preference";
    } else if (lowerDesc.includes("profile") || lowerDesc.includes("password") || lowerDesc.includes("avatar")) {
      category = "profile";
    }

    const newAct = {
      id: `act-${Date.now()}`,
      time: timeString,
      date: dateString,
      timestamp: now.toISOString(),
      category,
      desc
    };
    setActivities((prev) => {
      const updated = [newAct, ...prev].slice(0, 100);
      localStorage.setItem("activities", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  // Browser notifications dispatch trigger
  const dispatchBrowserNotification = (title, message) => {
    if (browserAlerts && window.Notification && Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
  };

  const addTask = async (form) => {
    try {
      await api.post("/tasks", form);
      fetchTasks();
      fetchGamificationData();
      logActivity(`Created task "${form.title}"`);
      dispatchBrowserNotification("Task Created", `Smart Task "${form.title}" is successfully scheduled.`);
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    
    if (quickDueDate) {
      if (new Date(quickDueDate) < new Date()) {
        setErrorToast(
          "You cannot create tasks for a past date.\nPlease select today or a future date."
        );
        return;
      }
    }
    
    await addTask({
      title: quickTitle,
      dueDate: quickDueDate || undefined,
      priority: quickPriority,
      category: quickCategory,
      status: "Todo",
      project: "General"
    });

    setQuickTitle("");
    setQuickDueDate("");
  };

  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setActiveTab("tasks");
  };

  const updateTask = async (id, updatedFields) => {
    try {
      await api.put(`/tasks/${id}`, updatedFields);
      fetchTasks();
      fetchGamificationData();
      setEditingTask(null);
      logActivity(`Updated task "${updatedFields.title}"`);
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const toggleStatus = async (task) => {
    try {
      // Toggle directly between Completed and Todo
      const nextStatus = task.status === "Completed" ? "Todo" : "Completed";
      await api.put(`/tasks/${task._id}`, { status: nextStatus });
      
      fetchTasks();
      fetchGamificationData();
      logActivity(`Updated task "${task.title}" status to ${nextStatus}`);
      
      if (nextStatus === "Completed") {
        dispatchBrowserNotification("Task Completed! 🎉", `Excellent! "${task.title}" has been completed.`);
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const startTimer = (taskId, initialTime) => {
    const now = Date.now();
    localStorage.setItem("activeTimerTaskId", taskId);
    localStorage.setItem("activeTimerStartTime", now.toString());
    localStorage.setItem("activeTimerInitialTime", initialTime.toString());
    setActiveTimer({ taskId, startTime: now, initialTime });
    logActivity("Started task timer");
  };

  const stopTimer = async (taskId) => {
    const savedId = localStorage.getItem("activeTimerTaskId");
    const savedStart = localStorage.getItem("activeTimerStartTime");
    const savedInitial = localStorage.getItem("activeTimerInitialTime");
    
    if (!savedId || savedId !== taskId) return;
    
    const startTime = parseInt(savedStart);
    const initialTime = parseFloat(savedInitial || "0");
    
    const elapsedMs = Date.now() - startTime;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const finalActualTime = parseFloat((initialTime + elapsedHours).toFixed(3));

    try {
      await api.put(`/tasks/${taskId}`, { actualTime: finalActualTime });
      fetchTasks();
      logActivity("Stopped task timer");
    } catch (err) {
      console.error("Failed to save tracked time", err);
    } finally {
      localStorage.removeItem("activeTimerTaskId");
      localStorage.removeItem("activeTimerStartTime");
      localStorage.removeItem("activeTimerInitialTime");
      setActiveTimer(null);
    }
  };

  const deleteTask = async (id) => {
    try {
      const deleted = tasks.find(t => t._id === id);
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      fetchGamificationData();
      logActivity(`Deleted task "${deleted ? deleted.title : 'Unknown'}"`);
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const duplicateTask = async (id) => {
    try {
      const original = tasks.find(t => t._id === id);
      await api.post(`/tasks/${id}/duplicate`);
      fetchTasks();
      fetchGamificationData();
      logActivity(`Duplicated task "${original ? original.title : ''}"`);
    } catch (err) {
      console.error("Failed to duplicate task", err);
    }
  };

  const archiveTask = async (id) => {
    try {
      const item = tasks.find(t => t._id === id);
      await api.put(`/tasks/${id}/archive`);
      fetchTasks();
      logActivity(`Archived task "${item ? item.title : ''}"`);
    } catch (err) {
      console.error("Failed to archive task", err);
    }
  };

  const restoreTask = async (id) => {
    try {
      await api.put(`/tasks/${id}/restore`);
      fetchTasks();
      logActivity(`Restored task`);
    } catch (err) {
      console.error("Failed to restore task", err);
    }
  };

  // Save Settings configuration
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await api.put("/auth/profile", {
        name: profileName,
        phone: profilePhone,
        theme: isDark ? "Dark" : "Light",
        language,
        timeZone,
        emailNotifications: emailAlerts,
        browserNotifications: browserAlerts,
        privacyPublic
      });

      login({
        ...user,
        name: res.data.name,
        settings: res.data.settings
      });

      localStorage.setItem("language", language);
      logActivity("Updated application preference settings");
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Error saving preferences.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await handleSaveSettings();
  };

  // Math metrics for Productivity score
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = total - completed;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed"
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Productivity Index calculation
  const productivityScore = Math.min(
    100,
    Math.round(completionRate * 0.7 + gamificationStats.dailyStreak * 5 + (completed * 2))
  );

  // Projects list lookup
  const projectsList = [...new Set(tasks.map(t => t.project || "General"))];
  const categoriesList = ["Personal", "Work", "College", "Study", "Shopping", "Health", "Finance", "Fitness", "Travel"];

  // Notifications calculation
  const getNotifications = () => {
    const list = [];
    const now = new Date();
    tasks.forEach(t => {
      if (t.status !== "Completed" && t.dueDate) {
        const dueDate = new Date(t.dueDate);
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          list.push({
            id: `notif-overdue-${t._id}`,
            type: "danger",
            title: "Task Overdue Alert",
            message: `"${t.title}" was due on ${dueDate.toLocaleDateString()}. Action needed.`,
            time: "Overdue"
          });
        } else if (diffDays <= 2) {
          list.push({
            id: `notif-soon-${t._id}`,
            type: "warning",
            title: "Task Deadline Near",
            message: `"${t.title}" is due in ${diffDays === 0 ? "today" : diffDays + " day(s)"}.`,
            time: "Approaching"
          });
        }
      }
    });
    return list;
  };

  const notifications = getNotifications();

  // Tasks Filter Logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPriority = filter === "All" || filter === "Completed" || filter === "Pending" ? true : t.priority === filter;
    
    let matchesStatus = true;
    if (filter === "Completed") matchesStatus = t.status === "Completed";
    else if (filter === "Pending") matchesStatus = t.status !== "Completed";

    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    const matchesProject = projectFilter === "All" || t.project === projectFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesCategory && matchesProject;
  });
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Rendering Views
  const renderDashboardOverview = () => {
    const upcoming = tasks
      .filter((t) => t.status !== "Completed")
      .slice(0, 3);

    return (
      <div className="dashboard-tab-view animate-fade-in">
        {/* Welcome Banner */}
        <div className="welcome-banner position-relative overflow-hidden p-4 rounded-4 mb-4">
          {/* Ambient Glowing Blobs */}
          <div className="banner-circle banner-circle-1"></div>
          <div className="banner-circle banner-circle-2"></div>
          
          <div className="position-relative z-1 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
            <div className="welcome-message">
              <span className="banner-badge mb-2 px-3 py-1.5 text-uppercase tracking-wider fw-semibold">
                {total === 0 
                  ? "Getting Started" 
                  : completionRate === 100 
                  ? "Daily Goal Achieved! 🎉" 
                  : completionRate >= 80 
                  ? "Crushing It! 🔥" 
                  : "Performance Insights"}
              </span>
              <h2 className="banner-title fw-extrabold mb-2 display-6">
                {getGreeting()}, {user?.name || "User"} 👋
              </h2>
              <p className="banner-desc mb-0 fs-6 max-w-500">
                {completionRate >= 80 
                  ? "Outstanding! You're operating at peak efficiency. Keep maintaining this incredible momentum!" 
                  : completionRate >= 50
                  ? "Great progress! You are more than halfway through your tasks. You've got this!"
                  : total === 0
                  ? "Welcome! Add your first task today and start tracking your productivity journey."
                  : "Every small task completed brings you closer to your goal. Let's make today count!"}
              </p>
              <button 
                className="btn btn-sm banner-action-btn mt-3 d-inline-flex align-items-center gap-2 fw-semibold"
                onClick={() => setActiveTab("tasks")}
                title="Go to Tasks Workspace"
              >
                {total === 0 ? "Create First Task" : completionRate === 100 ? "Review Tasks" : "Resume Workspace"}
                <FiChevronRight className="arrow-icon" />
              </button>
            </div>
            
            {/* Visual Glassmorphic Stats Widget */}
            <div 
              className="banner-stats-card p-3 rounded-4 d-flex align-items-center gap-3 min-w-220"
              title={`You have completed ${completed} out of ${total} tasks (${completionRate}% productivity rate)`}
              style={{ cursor: "help" }}
            >
              <div className="banner-stat-icon-wrapper rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                <FiActivity className="banner-activity-icon fs-4" />
              </div>
              <div className="flex-grow-1">
                <div className="banner-stats-title small fw-semibold text-uppercase tracking-wide mb-1">
                  Productivity Rate
                </div>
                <div className="d-flex align-items-baseline gap-2">
                  <span className="banner-stats-value fs-2 fw-bold line-height-1">{completionRate}%</span>
                  <span className="banner-stats-sub small fw-medium">
                    ({completed}/{total} Tasks)
                  </span>
                </div>
                <div className="progress banner-progress-track mt-2" style={{ height: '6px', borderRadius: '3px' }}>
                  <div 
                    className="progress-bar banner-progress-bar shadow-sm" 
                    style={{ 
                      width: `${completionRate}%`, 
                      borderRadius: '3px',
                      transition: 'width 1s ease-in-out'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Stats Cards Row (Rearranged to Top) */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-4 col-xl-2.4 col-custom-5">
            <div className="card border-0 p-3 h-100 quick-add-card card-stat-premium">
              <span className="text-muted small text-uppercase fw-semibold">{t("totalTasks")}</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="mb-0 fw-bold">{total}</h3>
                <div className="stat-circle bg-light text-primary"><FiCheckSquare size={16} /></div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-xl-2.4 col-custom-5">
            <div className="card border-0 p-3 h-100 quick-add-card card-stat-premium">
              <span className="text-muted small text-uppercase fw-semibold">{t("completedTasks")}</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="mb-0 fw-bold text-success">{completed}</h3>
                <div className="stat-circle bg-success bg-opacity-10 text-success"><FiCheckCircle size={16} /></div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-xl-2.4 col-custom-5">
            <div className="card border-0 p-3 h-100 quick-add-card card-stat-premium">
              <span className="text-muted small text-uppercase fw-semibold">{t("pendingTasks")}</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="mb-0 fw-bold text-warning">{pending}</h3>
                <div className="stat-circle bg-warning bg-opacity-10 text-warning"><FiClock size={16} /></div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-xl-2.4 col-custom-5">
            <div className="card border-0 p-3 h-100 quick-add-card card-stat-premium">
              <span className="text-muted small text-uppercase fw-semibold">{t("overdueTasks")}</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="mb-0 fw-bold text-danger">{overdue}</h3>
                <div className="stat-circle bg-danger bg-opacity-10 text-danger"><FiAlertTriangle size={16} /></div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-xl-2.4 col-custom-5">
            <div className="card border-0 p-3 h-100 quick-add-card card-stat-premium">
              <span className="text-muted small text-uppercase fw-semibold">{t("completionRate")}</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="mb-0 fw-bold text-info">{completionRate}%</h3>
                <div className="stat-circle bg-info bg-opacity-10 text-info"><FiBarChart2 size={16} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add and Productivity row */}
        <div className="row g-4 mb-4">
          {/* Quick Add Task */}
          <div className="col-lg-6">
            <div className="card border-0 p-4 h-100 quick-add-card">
              <h5 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2">
                <FiPlus className="text-primary" /> {t("quickAddTitle")}
              </h5>
              <form onSubmit={handleQuickAddSubmit} className="d-flex flex-column gap-3">
                <input 
                  type="text" 
                  className="quick-add-input" 
                  placeholder={t("quickAddPlaceholder")}
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  required
                />
                <div className="row g-2">
                  <div className="col-6">
                    <input 
                      type="datetime-local" 
                      className="quick-add-input w-100"
                      value={quickDueDate}
                      onChange={(e) => setQuickDueDate(e.target.value)}
                      min={formatDateTimeLocal(new Date())}
                    />
                  </div>
                  <div className="col-3">
                    <select 
                      className="quick-add-input w-100"
                      value={quickPriority}
                      onChange={(e) => setQuickPriority(e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="col-3">
                    <select 
                      className="quick-add-input w-100"
                      value={quickCategory}
                      onChange={(e) => setQuickCategory(e.target.value)}
                    >
                      {categoriesList.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="quick-add-btn mt-2" type="submit">
                  {t("addBtn")}
                </button>
              </form>
            </div>
          </div>

          {/* Productivity Score gauge representation */}
          <div className="col-lg-6">
            <div className="card border-0 p-4 h-100 quick-add-card text-center d-flex flex-column align-items-center justify-content-center">
              <span className="text-muted small text-uppercase fw-semibold mb-2">{t("productivityScore")}</span>
              <div className="productivity-circle-wrap position-relative" style={{ width: "120px", height: "120px" }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="48" fill="none" stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9"} strokeWidth="8" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="48" 
                    fill="none" 
                    stroke="url(#scoreGrad)" 
                    strokeWidth="8" 
                    strokeDasharray="301.6"
                    strokeDashoffset={301.6 - (productivityScore / 100) * 301.6}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "1.8rem", fontWeight: "800", color: "var(--dash-text-primary)" }}>
                  {productivityScore}
                </div>
              </div>
              <span className="text-muted small mt-3 px-3">Score is calculated from streak days, completion rates, and active challenges.</span>
            </div>
          </div>
        </div>

        {/* Projects & Upcoming Deadlines list */}
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 p-4 bg-white h-100 quick-add-card">
              <h5 className="fw-bold mb-3 text-secondary">{t("recentProjects")}</h5>
              <ul className="list-group list-group-flush small">
                {projectsList.slice(0, 5).map(p => (
                  <li key={p} className="list-group-item bg-transparent d-flex align-items-center justify-content-between px-0" style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}>
                    <span className="fw-semibold">{p}</span>
                    <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                      {tasks.filter(t => t.project === p).length} Tasks
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card border-0 p-4 bg-white h-100 quick-add-card">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0 text-secondary">{t("upcomingDeadlines")}</h5>
                <button className="btn btn-sm btn-link text-primary text-decoration-none" onClick={() => setActiveTab("tasks")}>
                  {t("manageTasks")}
                </button>
              </div>
              <div className="upcoming-list">
                {upcoming.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No pending tasks! Click "Manage Tasks" to add some.
                  </div>
                ) : (
                  upcoming.map((task) => (
                    <div className="upcoming-item p-3 mb-2 d-flex align-items-center justify-content-between" key={task._id}>
                      <div>
                        <h6 className="mb-1 fw-semibold" style={{ color: "var(--dash-text-primary)" }}>{task.title}</h6>
                        <span className="text-muted small">
                          Priority: <strong>{task.priority}</strong>
                          {task.dueDate && ` | Due: ${formatRelativeDate(task.dueDate)}`}
                        </span>
                      </div>
                      <button className="btn btn-sm btn-outline-success rounded-pill px-3" onClick={() => toggleStatus(task)}>
                        {t("doneBtn")}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTasksTab = () => {
    return (
      <div className="tasks-tab-view animate-fade-in">
        <TaskForm
          onAdd={addTask}
          editingTask={editingTask}
          onUpdateTask={updateTask}
          onCancelEdit={() => setEditingTask(null)}
          tasks={tasks}
        />

        {/* Filter Controls Panel */}
        <div className="d-flex align-items-center justify-content-between mb-3 mt-4 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h5 className="mb-0 fw-bold text-secondary me-2">{t("tasksList")} ({filteredTasks.length})</h5>
            <button 
              onClick={() => setShowArchived(!showArchived)} 
              className={`btn btn-sm ${showArchived ? "btn-warning" : "btn-outline-secondary"}`}
            >
              <FiArchive className="me-1" /> {showArchived ? "Viewing Archived" : "Show Archive"}
            </button>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button 
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 border-0 shadow-sm bg-white py-2 px-3" 
              onClick={() => setShowExportModal(true)}
              style={{ borderRadius: "8px", fontWeight: "500" }}
            >
              <FiDownload size={14} /> {t("exportPDF")}
            </button>

            {/* Project Filter */}
            <select 
              className="form-select w-auto border-0 shadow-sm py-2" 
              value={projectFilter} 
              onChange={(e) => setProjectFilter(e.target.value)} 
              style={{ borderRadius: "8px" }}
            >
              <option value="All">All Projects</option>
              {projectsList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select 
              className="form-select w-auto border-0 shadow-sm py-2" 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)} 
              style={{ borderRadius: "8px" }}
            >
              <option value="All">All Categories</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status / Priority Filter */}
            <select 
              className="form-select w-auto border-0 shadow-sm py-2" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
              style={{ borderRadius: "8px" }}
            >
              <option value="All">{t("allFilters")}</option>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Critical">Critical Priority</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-5 text-muted bg-white rounded shadow-sm border-0 card">
            <p className="mb-0">{t("noTasksFound")}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggle={toggleStatus}
              onDelete={deleteTask}
              onEdit={handleEditTaskClick}
              onDuplicate={duplicateTask}
              onArchive={archiveTask}
              onRestore={restoreTask}
              allTasks={tasks}
              activeTimer={activeTimer}
              onStartTimer={startTimer}
              onStopTimer={stopTimer}
            />
          ))
        )}
      </div>
    );
  };

  const renderAnalyticsTab = () => {
    // 1. Calculate Est vs Act Hours
    let totalEstHours = 0;
    let totalActHours = 0;
    tasks.forEach(t => {
      totalEstHours += t.estimatedTime || 0;
      totalActHours += t.actualTime || 0;
    });

    // 2. Generate Real Timeline Chart Data (past 7 days)
    const getPast7Days = () => {
      const days = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
          dateStr: d.toDateString(),
          name: dayNames[d.getDay()],
          dateObj: d
        });
      }
      return days;
    };

    const pastDays = getPast7Days();
    const completionData = pastDays.map(day => {
      // Find all tasks created before or on this day
      const totalOnDay = tasks.filter(t => {
        const createdAt = t.createdAt ? new Date(t.createdAt) : new Date();
        const compDate = new Date(day.dateObj);
        compDate.setHours(23, 59, 59, 999);
        return createdAt <= compDate;
      }).length;

      // Find all tasks completed before or on this day
      const completedOnDay = tasks.filter(t => {
        if (t.status !== "Completed") return false;
        const updatedAt = t.updatedAt ? new Date(t.updatedAt) : new Date();
        const compDate = new Date(day.dateObj);
        compDate.setHours(23, 59, 59, 999);
        return updatedAt <= compDate;
      }).length;

      return {
        name: day.name,
        Done: completedOnDay,
        Total: totalOnDay
      };
    });

    // 3. Category hours calculation
    const categoryHours = {};
    tasks.forEach(t => {
      const cat = t.category || "Personal";
      categoryHours[cat] = (categoryHours[cat] || 0) + (t.actualTime || 0);
    });

    const categoryChartData = Object.keys(categoryHours).map(cat => ({
      category: cat,
      Hours: categoryHours[cat]
    }));

    // 4. Priority counts
    const priorityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    tasks.forEach(t => {
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
    });

    const priorityChartData = [
      { name: "Low", value: priorityCounts.Low, color: "#10b981" },
      { name: "Medium", value: priorityCounts.Medium, color: "#3b82f6" },
      { name: "High", value: priorityCounts.High, color: "#f59e0b" },
      { name: "Critical", value: priorityCounts.Critical, color: "#ef4444" }
    ].filter(d => d.value > 0);

    // 5. Dynamic Heatmap grid (past 53 weeks = 371 calendar days contribution map)
    const getHeatmapGrid = () => {
      const today = new Date();
      // startSunday is 52 weeks (364 days) before the Sunday of this week
      const startSunday = new Date();
      startSunday.setDate(today.getDate() - 364 - today.getDay());
      startSunday.setHours(0, 0, 0, 0);

      const cells = [];
      const dateCursor = new Date(startSunday);
      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);

      while (dateCursor <= endDate) {
        const dateStr = dateCursor.toDateString();

        // Count tasks completed on this specific day
        const completedOnDay = tasks.filter(t => {
          if (t.status !== "Completed") return false;
          const compDate = t.updatedAt ? new Date(t.updatedAt) : new Date();
          return compDate.toDateString() === dateStr;
        }).length;

        let intensity = "none";
        if (completedOnDay === 1) intensity = "low";
        else if (completedOnDay === 2) intensity = "medium";
        else if (completedOnDay >= 3) intensity = "high";

        cells.push({
          date: new Date(dateCursor),
          day: dateCursor.getDate(),
          count: completedOnDay,
          intensity
        });

        dateCursor.setDate(dateCursor.getDate() + 1);
      }
      return cells;
    };

    const heatmapGrid = getHeatmapGrid();
    const heatmapWeeks = [];
    for (let i = 0; i < heatmapGrid.length; i += 7) {
      heatmapWeeks.push(heatmapGrid.slice(i, i + 7));
    }

    return (
      <div className="analytics-tab-view animate-fade-in">
        {/* Row of KPI cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card p-3 shadow-sm border-0 bg-white rounded-4 analytics-kpi-card h-100 d-flex flex-row align-items-center gap-3">
              <div className="kpi-icon-wrapper bg-primary bg-opacity-10 text-primary">
                <FiZap />
              </div>
              <div>
                <span className="small text-muted fw-semibold d-block">Productivity Index</span>
                <h4 className="fw-bold mb-0 text-dark">{productivityScore}<span className="small text-muted fw-normal" style={{ fontSize: "0.75rem" }}>/100</span></h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 shadow-sm border-0 bg-white rounded-4 analytics-kpi-card h-100 d-flex flex-row align-items-center gap-3">
              <div className="kpi-icon-wrapper bg-success bg-opacity-10 text-success">
                <FiCheckCircle />
              </div>
              <div className="flex-grow-1">
                <span className="small text-muted fw-semibold d-block">Completion Rate</span>
                <h4 className="fw-bold mb-0 text-dark">{completionRate}%</h4>
                <div className="progress mt-1.5" style={{ height: "4px" }}>
                  <div className="progress-bar bg-success" style={{ width: `${completionRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 shadow-sm border-0 bg-white rounded-4 analytics-kpi-card h-100 d-flex flex-row align-items-center gap-3">
              <div className="kpi-icon-wrapper bg-info bg-opacity-10 text-info">
                <FiClock />
              </div>
              <div>
                <span className="small text-muted fw-semibold d-block">Time Tracked</span>
                <h4 className="fw-bold mb-0 text-dark">
                  {totalActHours.toFixed(1)}<span className="small text-muted fw-normal" style={{ fontSize: "0.75rem" }}> hrs</span>
                </h4>
                <span className="text-muted" style={{ fontSize: "0.68rem" }}>Estimated: {totalEstHours.toFixed(1)} hrs</span>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 shadow-sm border-0 bg-white rounded-4 analytics-kpi-card h-100 d-flex flex-row align-items-center gap-3">
              <div className="kpi-icon-wrapper bg-warning bg-opacity-10 text-warning">
                <FiActivity />
              </div>
              <div>
                <span className="small text-muted fw-semibold d-block">Total Tasks Overview</span>
                <h4 className="fw-bold mb-0 text-dark">{total}</h4>
                <span className="text-muted" style={{ fontSize: "0.68rem" }}>Done: {completed} | Pending: {total - completed}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {/* Recharts Area Chart for completion timelines */}
          <div className="col-lg-8">
            <div className="card p-4 shadow-sm border-0 bg-white rounded-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold text-secondary mb-0">Productivity Chart Timeline</h5>
                <div className="d-flex gap-3 text-muted small">
                  <span>Done: <strong className="text-primary">{completed}</strong></span>
                  <span>Total: <strong className="text-secondary">{total}</strong></span>
                </div>
              </div>
              <div style={{ width: "100%", height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={completionData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <filter id="shadowDone" height="120%">
                        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#7c3aed" floodOpacity="0.25" />
                      </filter>
                      <filter id="shadowTotal" height="120%">
                        <feDropShadow dx="0" dy="4" stdDeviation="2" floodColor="#6366f1" floodOpacity="0.15" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--dash-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="var(--dash-text-muted)" fontSize={11} />
                    <YAxis axisLine={false} tickLine={false} stroke="var(--dash-text-muted)" fontSize={11} allowDecimals={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area type="monotone" name="Completed" dataKey="Done" stroke="#7c3aed" strokeWidth={3} filter="url(#shadowDone)" activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2, fill: '#fff' }} fillOpacity={1} fill="url(#colorDone)" />
                    <Area type="monotone" name="Total Tasks" dataKey="Total" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" filter="url(#shadowTotal)" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pie Chart for Priority Distribution */}
          <div className="col-lg-4">
            <div className="card p-4 shadow-sm border-0 bg-white rounded-4 h-100 d-flex flex-column">
              <h5 className="fw-bold text-secondary mb-3">Priority Distribution</h5>
              {priorityChartData.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-5">
                  <FiActivity size={40} className="text-muted mb-2 opacity-50" />
                  <div className="text-muted small">No task priorities recorded yet</div>
                </div>
              ) : (
                <div className="flex-grow-1 d-flex flex-column justify-content-center">
                  <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: "100%", height: "200px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {priorityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="position-absolute text-center" style={{ pointerEvents: "none" }}>
                      <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.6rem" }}>{total}</h3>
                      <span className="text-muted small fw-semibold">Total Tasks</span>
                    </div>
                  </div>
                  
                  {/* Custom Styled Legend */}
                  <div className="custom-legend-container">
                    {priorityChartData.map((entry, index) => (
                      <div key={index} className="custom-legend-item">
                        <span className="custom-legend-color" style={{ backgroundColor: entry.color }}></span>
                        <span>{entry.name}: <strong>{entry.value}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Time spent per category bar chart */}
          <div className="col-lg-7">
            <div className="card p-4 shadow-sm border-0 bg-white rounded-4 h-100">
              <h5 className="fw-bold text-secondary mb-3">Time Spent per Category (Hours)</h5>
              {categoryChartData.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5 h-100">
                  <FiClock size={40} className="text-muted mb-2 opacity-50" />
                  <div className="text-muted small">No time hours logged yet</div>
                </div>
              ) : (
                <div style={{ width: "100%", height: "240px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--dash-border)" />
                      <XAxis dataKey="category" axisLine={false} tickLine={false} stroke="var(--dash-text-muted)" fontSize={11} />
                      <YAxis axisLine={false} tickLine={false} stroke="var(--dash-text-muted)" fontSize={11} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar name="Hours Logged" dataKey="Hours" fill="url(#colorHours)" radius={[6, 6, 0, 0]} maxBarSize={45} background={{ fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', radius: 6 }} activeBar={{ fill: '#d946ef', strokeWidth: 1 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Streak Tracker Heatmap */}
          <div className="col-lg-5">
            <div className="card p-4 shadow-sm border-0 bg-white rounded-4 h-100 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold text-secondary mb-0">Streak Heatmap</h5>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill small fw-semibold">
                  {gamificationStats.dailyStreak} Day Streak 🔥
                </span>
              </div>
              <p className="text-muted small mb-3">Completions calendar map over the last 53 weeks.</p>
              
              <div className="github-heatmap-wrapper mb-3">
                <div className="github-heatmap-container">
                  {/* Left row labels for days */}
                  <div className="github-day-labels">
                    <span>Sun</span>
                    <span>Tue</span>
                    <span>Thu</span>
                    <span>Sat</span>
                  </div>
                  
                  <div className="github-heatmap-grid-scrollable">
                    {/* Month labels row */}
                    <div className="github-months-row">
                      {heatmapWeeks.map((week, idx) => {
                        const firstDay = week[0].date;
                        // Show month label if it's the first week of the month, or first week overall
                        const showLabel = idx === 0 || (firstDay.getDate() <= 7 && firstDay.getDay() === 0);
                        return (
                          <div 
                            key={idx} 
                            style={{ 
                              width: "14px", // matches cell size 11px + 3px gap
                              visibility: showLabel ? "visible" : "hidden",
                              whiteSpace: "nowrap",
                              fontSize: "9px"
                            }}
                          >
                            {showLabel ? firstDay.toLocaleDateString(undefined, { month: "short" }) : ""}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Contribution cells grid */}
                    <div className="github-heatmap-grid">
                      {heatmapGrid.map((g, idx) => (
                        <div 
                          key={idx} 
                          className={`github-heatmap-cell intensity-${g.intensity}`}
                          title={`${g.count} task${g.count === 1 ? "" : "s"} completed on ${g.date.toDateString()}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top text-muted small">
                <span>Less</span>
                <div className="d-flex gap-1 align-items-center">
                  <span className="github-heatmap-cell intensity-none" style={{ width: "11px", height: "11px", borderRadius: "2px", display: "inline-block" }}></span>
                  <span className="github-heatmap-cell intensity-low" style={{ width: "11px", height: "11px", borderRadius: "2px", display: "inline-block" }}></span>
                  <span className="github-heatmap-cell intensity-medium" style={{ width: "11px", height: "11px", borderRadius: "2px", display: "inline-block" }}></span>
                  <span className="github-heatmap-cell intensity-high" style={{ width: "11px", height: "11px", borderRadius: "2px", display: "inline-block" }}></span>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarTab = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysArray = [];
    for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
    for (let i = 1; i <= totalDays; i++) daysArray.push(i);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const changeMonth = (offset) => {
      setCalendarDate(new Date(year, month + offset, 1));
      setSelectedDay(null);
    };

    const handleDayClick = (day) => {
      if (!day) return;
      setSelectedDay(day);
    };

    // Rescheduling Simulation trigger on click
    const rescheduleTaskDate = async (taskId, nextDateString) => {
      try {
        if (nextDateString && new Date(nextDateString) < new Date()) {
          setErrorToast(
            "You cannot reschedule tasks for a past date.\nPlease select today or a future date."
          );
          return;
        }
        await api.put(`/tasks/${taskId}`, { dueDate: nextDateString });
        fetchTasks();
        logActivity("Rescheduled task due date");
      } catch (err) {
        console.error("Reschedule failed", err);
        if (err.response && err.response.data && err.response.data.message) {
          setErrorToast(err.response.data.message);
        } else {
          setErrorToast("Failed to reschedule task.");
        }
      }
    };

    const activeDayTasks = !selectedDay
      ? []
      : tasks.filter((t) => {
          if (!t.dueDate) return false;
          const tDate = new Date(t.dueDate);
          return (
            tDate.getDate() === selectedDay &&
            tDate.getMonth() === month &&
            tDate.getFullYear() === year
          );
        });

    return (
      <div className="calendar-tab-view animate-fade-in">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="btn-group shadow-sm">
            <button className={`btn btn-sm ${calendarView === "month" ? "btn-primary" : "btn-light border"}`} onClick={() => setCalendarView("month")}>Monthly</button>
            <button className={`btn btn-sm ${calendarView === "week" ? "btn-primary" : "btn-light border"}`} onClick={() => setCalendarView("week")}>Weekly</button>
            <button className={`btn btn-sm ${calendarView === "day" ? "btn-primary" : "btn-light border"}`} onClick={() => setCalendarView("day")}>Daily</button>
            <button className={`btn btn-sm ${calendarView === "agenda" ? "btn-primary" : "btn-light border"}`} onClick={() => setCalendarView("agenda")}>Agenda</button>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold text-secondary mb-0">
              {monthNames[month]} {year}
            </h5>
            <div className="d-flex gap-1">
              <button className="btn btn-xs btn-outline-secondary py-1 px-2" onClick={() => changeMonth(-1)}><FiChevronLeft /></button>
              <button className="btn btn-xs btn-outline-secondary py-1 px-2" onClick={() => changeMonth(1)}><FiChevronRight /></button>
            </div>
          </div>
        </div>

        {calendarView === "month" && (
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card p-4 border-0 shadow-sm bg-white rounded-4">
                <div className="calendar-grid-header d-grid text-center text-muted small fw-semibold mb-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div className="calendar-grid-body d-grid text-center" style={{ gridTemplateColumns: "repeat(7, 1fr)", rowGap: "8px" }}>
                  {daysArray.map((day, idx) => {
                    const cellDate = day ? new Date(year, month, day) : null;
                    if (cellDate) {
                      cellDate.setHours(23, 59, 59, 999);
                    }
                    const isPast = day && cellDate < new Date();

                    const isToday =
                      day === new Date().getDate() &&
                      month === new Date().getMonth() &&
                      year === new Date().getFullYear();

                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const isTomorrow = day &&
                      day === tomorrow.getDate() &&
                      month === tomorrow.getMonth() &&
                      year === tomorrow.getFullYear();

                    const dayTasks = !day
                      ? []
                      : tasks.filter((t) => {
                          if (!t.dueDate) return false;
                          const tDate = new Date(t.dueDate);
                          return (
                            tDate.getDate() === day &&
                            tDate.getMonth() === month &&
                            tDate.getFullYear() === year
                          );
                        });

                    const hasCritical = dayTasks.some((t) => t.priority === "Critical");
                    const hasHigh = dayTasks.some((t) => t.priority === "High");

                    let cellClass = "";
                    if (!day) {
                      cellClass = "day-empty";
                    } else if (isPast) {
                      cellClass = "day-disabled opacity-40 text-muted";
                    } else {
                      cellClass = "cursor-pointer day-active";
                      if (selectedDay === day) {
                        cellClass += " bg-primary text-white";
                      } else if (isToday) {
                        cellClass += " bg-primary-subtle text-primary border border-primary";
                      } else if (isTomorrow) {
                        cellClass += " bg-warning-subtle text-warning-emphasis border border-warning";
                      }
                    }

                    return (
                      <div
                        key={idx}
                        className={`calendar-day-cell p-2 position-relative rounded-3 d-flex flex-column align-items-center justify-content-center ${cellClass}`}
                        onClick={() => !isPast && handleDayClick(day)}
                        style={{ 
                          minHeight: "50px",
                          pointerEvents: isPast ? "none" : "auto",
                          cursor: isPast ? "not-allowed" : "pointer"
                        }}
                      >
                        {day && <span className="fw-semibold">{day}</span>}
                        {day && dayTasks.length > 0 && (
                          <div className="d-flex gap-1 justify-content-center mt-1 position-absolute bottom-0 mb-1">
                            {hasCritical && <span className="calendar-dot bg-danger"></span>}
                            {hasHigh && <span className="calendar-dot bg-warning"></span>}
                            {!hasCritical && !hasHigh && <span className="calendar-dot bg-success"></span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card p-4 border-0 shadow-sm bg-white rounded-4 h-100">
                <h5 className="fw-bold text-secondary mb-3">
                  {selectedDay ? `Tasks for ${monthNames[month]} ${selectedDay}` : "Select a date"}
                </h5>
                <div className="calendar-day-details-list">
                  {!selectedDay ? (
                    <div className="text-center py-5 text-muted">Click any date to see scheduled tasks.</div>
                  ) : activeDayTasks.length === 0 ? (
                    <div className="text-center py-5 text-muted">No tasks due today.</div>
                  ) : (
                    activeDayTasks.map((t) => (
                      <div className="p-3 mb-2 bg-light rounded-3 d-flex align-items-center justify-content-between" key={t._id}>
                        <div>
                          <h6 className="mb-1 fw-bold text-dark">{t.title}</h6>
                          <div className="d-flex gap-1.5 flex-wrap">
                            <span className="badge bg-secondary-subtle text-secondary small py-0.5 px-1.5 me-1">{t.category}</span>
                            {t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed" && <span className="badge bg-danger text-white small py-0.5 px-1.5 me-1">Overdue</span>}
                            {t.dueDate && Math.round((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) === 0 && t.status !== "Completed" && <span className="badge bg-warning text-dark small py-0.5 px-1.5 me-1">Due Today</span>}
                            {t.dueDate && new Date(t.dueDate) > new Date() && t.status !== "Completed" && <span className="badge bg-primary text-white small py-0.5 px-1.5">Upcoming</span>}
                          </div>
                        </div>
                        <input 
                          type="datetime-local" 
                          className="form-control form-control-sm w-auto py-0" 
                          value={t.dueDate ? formatDateTimeLocal(t.dueDate) : ""}
                          onChange={(e) => rescheduleTaskDate(t._id, e.target.value)}
                          min={formatDateTimeLocal(new Date())}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {calendarView === "week" && (
          <div className="card p-4 border-0 shadow-sm bg-white rounded-4">
            <div className="row g-2">
              {Array.from({ length: 7 }).map((_, idx) => {
                const date = new Date(calendarDate);
                date.setDate(date.getDate() - date.getDay() + idx);
                const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
                const dayNum = date.getDate();
                const weekTasks = tasks.filter(t => {
                  if (!t.dueDate) return false;
                  const d = new Date(t.dueDate);
                  return d.getDate() === dayNum && d.getMonth() === date.getMonth();
                });

                return (
                  <div key={idx} className="col border-end px-2" style={{ minWidth: "120px" }}>
                    <div className="text-center py-2 bg-light rounded mb-3">
                      <div className="fw-bold">{dayName}</div>
                      <div className="text-muted small">{dayNum}</div>
                    </div>
                    {weekTasks.map(t => (
                      <div key={t._id} className="p-2 mb-2 bg-primary bg-opacity-10 text-primary small rounded" style={{ fontSize: "11px" }}>
                        <strong>{t.title}</strong>
                        <div className="text-muted">{t.status}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {calendarView === "day" && (
          <div className="card p-4 border-0 shadow-sm bg-white rounded-4">
            <h6 className="fw-bold">Today's Timeline</h6>
            <div className="timeline-day-wrapper py-3">
              {tasks.filter(t => {
                if (!t.dueDate) return false;
                const d = new Date(t.dueDate);
                return d.toDateString() === new Date().toDateString();
              }).map(t => (
                <div key={t._id} className="p-3 mb-2 border rounded bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 fw-bold">{t.title}</h6>
                    <span className="text-muted small">Category: {t.category}</span>
                  </div>
                  <span className={`badge ${t.status === 'Completed' ? 'bg-success' : 'bg-warning'}`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {calendarView === "agenda" && (
          <div className="card p-4 border-0 shadow-sm bg-white rounded-4">
            <h6 className="fw-bold mb-3">Agenda View</h6>
            <ul className="list-group list-group-flush">
              {tasks.filter(t => t.dueDate).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).map(t => (
                <li key={t._id} className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0">
                  <div>
                    <div className="fw-bold">{t.title}</div>
                    <span className="small text-muted">{formatRelativeDate(t.dueDate)}</span>
                  </div>
                  <span className="badge bg-secondary">{t.category}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderNotificationsTab = () => {
    return (
      <div className="notifications-tab-view animate-fade-in">
        <div className="card p-4 border-0 shadow-sm bg-white rounded-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold text-secondary mb-0">System & Task Notifications</h5>
            <span className="badge bg-primary px-3 py-2 rounded-pill">{notifications.length} Alerts</span>
          </div>

          <div className="notifications-list-wrapper">
            {notifications.length === 0 ? (
              <div className="text-center py-5 text-muted">All caught up! No active warnings or task alerts.</div>
            ) : (
              notifications.map((notif) => {
                let alertClass = "alert-info";
                if (notif.type === "danger") alertClass = "alert-danger";
                if (notif.type === "warning") alertClass = "alert-warning";

                return (
                  <div className={`alert ${alertClass} border-0 shadow-sm p-3 mb-3 rounded-3 d-flex align-items-start gap-3`} key={notif.id}>
                    <div className="alert-icon-wrapper mt-1">
                      {notif.type === "danger" && <FiAlertTriangle size={18} />}
                      {notif.type === "warning" && <FiClock size={18} />}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="d-block">{notif.title}</strong>
                        <span className="small text-muted fw-semibold" style={{ fontSize: "11px" }}>{notif.time}</span>
                      </div>
                      <span className="small text-secondary mt-1 d-block">{notif.message}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfileTab = () => {
    return (
      <div className="profile-tab-view animate-fade-in" style={{ maxWidth: "680px" }}>
        {/* Profile Details */}
        <div className="card p-4 border-0 shadow-sm bg-white rounded-4 mb-4">
          <h4 className="fw-bold text-secondary mb-4">{t("accountSettings")}</h4>
          
          <div className="d-flex align-items-center gap-4 mb-4 flex-wrap">
            <div className="profile-selected-avatar-large d-flex align-items-center justify-content-center text-white" style={{ width: "80px", height: "80px", borderRadius: "50%", background: avatarPresets[avatarIndex].bg, fontSize: "40px" }}>
              {avatarPresets[avatarIndex].emoji}
            </div>
            <div>
              <h6 className="mb-2 fw-semibold text-muted">Select Avatar Preset:</h6>
              <div className="d-flex gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`btn-avatar-choice ${avatarIndex === idx ? "active-avatar" : ""}`}
                    onClick={() => {
                      setAvatarIndex(idx);
                      localStorage.setItem("avatarIndex", idx);
                    }}
                    style={{ background: preset.bg, width: "40px", height: "40px", borderRadius: "50%", border: avatarIndex === idx ? "3px solid #000" : "none", fontSize: "20px" }}
                  >
                    {preset.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Full Name</label>
              <input
                className="form-control"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Email Address</label>
              <input
                className="form-control"
                type="email"
                value={user?.email || ""}
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Phone Number</label>
              <input
                className="form-control"
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary px-4 py-2 mt-2" type="submit">
              {t("saveChanges")}
            </button>
          </form>
        </div>

        {/* Password Update Settings */}
        <div className="card p-4 border-0 shadow-sm bg-white rounded-4 mb-4">
          <h4 className="fw-bold text-secondary mb-4">Security Credentials</h4>
          {securityError && <div className="alert alert-danger py-2 px-3 small mb-3">{securityError}</div>}
          {securitySuccess && <div className="alert alert-success py-2 px-3 small mb-3">{securitySuccess}</div>}

          <form onSubmit={async (e) => {
            e.preventDefault();
            setSecurityError("");
            setSecuritySuccess("");
            if (newPassword !== confirmPassword) {
              setSecurityError("Confirm password does not match.");
              return;
            }
            try {
              await api.put("/auth/change-password", { currentPassword, newPassword });
              setSecuritySuccess("Password updated successfully!");
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            } catch (err) {
              setSecurityError(err.response?.data?.message || "Password update failed.");
            }
          }}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Current Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">New Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Confirm New Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary px-4 py-2 mt-2" type="submit">
              Update Password
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => {
    const handleDeleteAccount = () => {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete your account? This action is permanent and cannot be undone."
      );
      if (confirmDelete) {
        api.delete("/auth/delete-account").then(() => {
          logout();
          navigate("/login");
          alert("Your account has been deleted successfully.");
        }).catch(err => {
          console.error("Delete failed", err);
        });
      }
    };

    return (
      <div className="settings-tab-view animate-fade-in" style={{ maxWidth: "680px" }}>
        <div className="card p-4 border-0 shadow-sm bg-white rounded-4 mb-4">
          <h4 className="fw-bold text-secondary mb-4">{t("appPreferences")}</h4>

          {/* Time Zone selection */}
          <div className="mb-3 pb-3 border-bottom">
            <label className="form-label fw-semibold text-dark">{t("timezone")}</label>
            <select className="form-select" value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="IST">IST (Indian Standard Time)</option>
              <option value="GMT">GMT (Greenwich Mean Time)</option>
            </select>
          </div>

          {/* Language selector */}
          <div className="mb-3 pb-3 border-bottom">
            <label className="form-label fw-semibold text-dark">{t("language")}</label>
            <select className="form-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Hindi">Hindi (हिंदी)</option>
            </select>
          </div>

          {/* Alert Switches */}
          <div className="settings-switch-group d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <div>
              <span className="d-block fw-semibold text-dark">{t("emailNotif")}</span>
              <span className="text-muted small">Receive email alerts for task due dates.</span>
            </div>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                role="switch"
                className="form-check-input"
                checked={emailAlerts}
                onChange={() => setEmailAlerts(!emailAlerts)}
              />
            </div>
          </div>

          <div className="settings-switch-group d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <div>
              <span className="d-block fw-semibold text-dark">{t("browserNotif")}</span>
              <span className="text-muted small">Allow local desktop alert logs.</span>
            </div>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                role="switch"
                className="form-check-input"
                checked={browserAlerts}
                onChange={() => setBrowserAlerts(!browserAlerts)}
              />
            </div>
          </div>

          <div className="settings-switch-group d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="d-block fw-semibold text-dark">{t("privacyPublic")}</span>
              <span className="text-muted small">Enable leaderboard display rankings.</span>
            </div>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                role="switch"
                className="form-check-input"
                checked={privacyPublic}
                onChange={() => setPrivacyPublic(!privacyPublic)}
              />
            </div>
          </div>

          <button className="btn btn-primary w-100 py-2 mt-3 fw-semibold" onClick={handleSaveSettings}>
            {t("saveChanges")}
          </button>
        </div>

        {/* Danger zone actions */}
        <div className="card p-4 border-0 shadow-sm bg-white rounded-4 border-danger border-opacity-25">
          <h4 className="fw-bold text-danger mb-3">Danger Zone</h4>
          <p className="small text-muted mb-4">
            Once you delete your account, there is no going back. All tasks and configurations will be permanently removed.
          </p>
          <div className="d-flex gap-3">
            <button className="btn btn-outline-danger" onClick={handleDeleteAccount}>
              Permanently Delete Account
            </button>
            <button className="btn btn-outline-secondary" onClick={() => logout()}>
              Sign Out Session
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryTab = () => {
    // Parser for dynamic activity details
    const parseActivityDesc = (desc) => {
      let title = desc;
      let subtitle = "System activity logged";

      if (desc.includes("Created task")) {
        const match = desc.match(/Created task "(.*)"/);
        title = `Created new task "${match ? match[1] : 'Task'}"`;
        subtitle = "New task has been created";
      } else if (desc.includes("Updated task")) {
        const match = desc.match(/Updated task "(.*)"/);
        title = `Updated task "${match ? match[1] : 'Task'}"`;
        subtitle = "Task details have been updated";
      } else if (desc.includes("Marked task") && desc.includes("as Completed")) {
        const match = desc.match(/Marked task "(.*)" as Completed/);
        title = `Completed task "${match ? match[1] : 'Task'}"`;
        subtitle = "Task marked as completed";
      } else if (desc.includes("Marked task") && desc.includes("as Pending")) {
        const match = desc.match(/Marked task "(.*)" as Pending/);
        title = `Reopened task "${match ? match[1] : 'Task'}"`;
        subtitle = "Task marked as pending";
      } else if (desc.includes("Deleted task")) {
        const match = desc.match(/Deleted task "(.*)"/);
        title = `Deleted task "${match ? match[1] : 'Task'}"`;
        subtitle = "Task has been deleted";
      }

      return { title, subtitle };
    };

    const isWithinDays = (timestampStr, daysLimit) => {
      if (!timestampStr) return false;
      const actDate = new Date(timestampStr);
      const now = new Date();
      const diffTime = now - actDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= daysLimit;
    };

    const filteredActivities = activities.filter((act) => {
      const matchesSearch = act.desc.toLowerCase().includes(historySearchQuery.toLowerCase());
      const actCategory = act.category || "system";
      const matchesCategory = historyCategoryFilter === "All" || actCategory === historyCategoryFilter;
      
      let matchesDate = true;
      const todayString = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

      if (historyDateFilter === "Today") {
        matchesDate = act.date === todayString;
      } else if (historyDateFilter === "Yesterday") {
        matchesDate = act.date === yesterdayString;
      } else if (historyDateFilter === "Last7") {
        matchesDate = isWithinDays(act.timestamp, 7);
      }

      return matchesSearch && matchesCategory && matchesDate;
    });

    const handleExportHistory = (format) => {
      if (format === "json") {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activities, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `activity_history_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      } else {
        let csvContent = "data:text/csv;charset=utf-8,ID,Timestamp,Date,Time,Category,Description\n";
        activities.forEach(act => {
          const row = [
            act.id,
            act.timestamp || "",
            act.date || "",
            act.time || "",
            act.category || "system",
            `"${act.desc.replace(/"/g, '""')}"`
          ].join(",");
          csvContent += row + "\n";
        });
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", encodeURI(csvContent));
        downloadAnchor.setAttribute("download", `activity_history_${Date.now()}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    };

    const deleteSingleActivity = (id) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this activity log?");
      if (confirmDelete) {
        setActivities((prev) => {
          const updated = prev.filter((act) => act.id !== id);
          localStorage.setItem("activities", JSON.stringify(updated));
          return updated;
        });
      }
    };

    const getCategoryDetails = (category, desc) => {
      let color = "#3b82f6";
      let bg = "rgba(59, 130, 246, 0.08)";
      let icon = <FiInfo size={16} />;
      let badgeLabel = "System Sync";

      if (category === "task") {
        if (desc.toLowerCase().includes("completed")) {
          color = "#10b981";
          bg = "rgba(16, 185, 129, 0.08)";
          icon = <FiCheckCircle size={16} />;
          badgeLabel = "Task Completed";
        } else if (desc.toLowerCase().includes("created")) {
          color = "#3b82f6";
          bg = "rgba(59, 130, 246, 0.08)";
          icon = <FiPlus size={16} />;
          badgeLabel = "Task Created";
        } else if (desc.toLowerCase().includes("deleted")) {
          color = "#ef4444";
          bg = "rgba(239, 68, 68, 0.08)";
          icon = <FiTrash2 size={16} />;
          badgeLabel = "Task Deleted";
        } else {
          color = "#f59e0b";
          bg = "rgba(245, 158, 11, 0.08)";
          icon = <FiEdit2 size={16} />;
          badgeLabel = "Task Updated";
        }
      } else if (category === "preference") {
        color = "#8b5cf6";
        bg = "rgba(139, 92, 246, 0.08)";
        icon = <FiMoon size={16} />;
        badgeLabel = "App Settings Update";
      } else if (category === "profile") {
        color = "#f59e0b";
        bg = "rgba(245, 158, 11, 0.08)";
        icon = <FiUser size={16} />;
        badgeLabel = "Profile Update";
      }

      return { color, bg, icon, badgeLabel };
    };

    const grouped = {};
    const paginatedActivities = filteredActivities.slice(0, historyLimit);
    paginatedActivities.forEach((act) => {
      const dateKey = act.date || "Past Activities";
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(act);
    });

    return (
      <div className="history-tab-view animate-fade-in">
        <div className="card p-4 border-0 shadow-sm bg-white rounded-4">
          <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
            <div className="flex-grow-1" style={{ minWidth: "260px" }}>
              <div className="input-group">
                <span className="input-group-text bg-white border-0 text-muted"><FiSearch size={16} /></span>
                <input 
                  type="text" 
                  className="form-control border-0 py-2" 
                  placeholder="Search logs..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <select 
                className="form-select border" 
                value={historyCategoryFilter} 
                onChange={(e) => setHistoryCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="task">Task Operations</option>
                <option value="preference">App Settings</option>
                <option value="profile">Profile & Security</option>
                <option value="system">System Synchronizations</option>
              </select>
            </div>

            <button className="btn btn-outline-secondary" onClick={() => setExportDropdownOpen(!exportDropdownOpen)}>
              <FiDownload /> Export
            </button>
            {exportDropdownOpen && (
              <div className="dropdown-menu show shadow p-2 position-absolute" style={{ right: "20px", marginTop: "40px" }}>
                <button className="dropdown-item btn-sm" onClick={() => handleExportHistory("json")}>JSON</button>
                <button className="dropdown-item btn-sm" onClick={() => handleExportHistory("csv")}>CSV</button>
              </div>
            )}
          </div>

          <div className="timeline py-3">
            {Object.keys(grouped).map(dateKey => (
              <div key={dateKey} className="mb-4">
                <h6 className="fw-bold text-primary mb-2">{dateKey}</h6>
                {grouped[dateKey].map(act => {
                  const details = getCategoryDetails(act.category, act.desc);
                  const parsed = parseActivityDesc(act.desc);
                  return (
                    <div key={act.id} className="d-flex align-items-center justify-content-between p-3 border rounded mb-2 bg-light">
                      <div className="d-flex align-items-center gap-2">
                        {details.icon}
                        <div>
                          <div className="fw-bold small">{parsed.title}</div>
                          <div className="text-muted small" style={{ fontSize: "11px" }}>{parsed.subtitle}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-secondary-subtle text-dark" style={{ fontSize: "10px" }}>{details.badgeLabel}</span>
                        <span className="small text-muted">{act.time}</span>
                        <button className="btn btn-link text-danger p-0" onClick={() => deleteSingleActivity(act.id)}><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGamificationTab = () => {
    const xp = gamificationStats.xp || 0;
    const level = gamificationStats.level || 1;
    const dailyStreak = gamificationStats.dailyStreak || 0;
    const badges = gamificationStats.badges || [];
    const achievements = gamificationStats.achievements || [];

    const currentXp = xp % 100;
    const nextLevelXp = 100;
    const progressPercent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

    const badgeList = [
      { id: "first_task", name: "First Step", emoji: "👟", desc: "Created your first task" },
      { id: "complete_task", name: "Task Beginner", emoji: "🎯", desc: "Completed 1 task" },
      { id: "complete_5_tasks", name: "Task Master", emoji: "🏆", desc: "Completed 5 tasks" },
      { id: "complete_15_tasks", name: "Productivity Legend", emoji: "👑", desc: "Completed 15 tasks" },
      { id: "high_priority", name: "High Stakes", emoji: "🔥", desc: "Completed a High priority task" },
      { id: "streak_3", name: "Streak Starter", emoji: "⚡", desc: "Reached a 3-day daily streak" },
    ];

    return (
      <div className="gamification-tab animate-fade-in">
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 p-4 bg-white text-dark rounded-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold mb-2">
                    Level {level} Task Knight
                  </span>
                  <h3 className="fw-bold mb-1">Your Growth Journey</h3>
                  <p className="text-muted mb-0 small">Earn XP by completing tasks and maintaining daily streaks.</p>
                </div>
                <div className="d-flex align-items-center gap-2 bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-3">
                  <FiZap size={20} className="animate-pulse" />
                  <div>
                    <div className="fw-bold">{dailyStreak} Days</div>
                    <span className="text-muted small" style={{ fontSize: "0.75rem" }}>Daily Streak</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold small">Progress to Level {level + 1}</span>
                  <span className="text-muted small fw-semibold">{currentXp} / {nextLevelXp} XP</span>
                </div>
                <div className="progress rounded-pill" style={{ height: "14px" }}>
                  <div className="progress-bar progress-bar-striped progress-bar-animated bg-primary" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className="text-muted small mt-2 d-inline-block">Total XP accumulated: <strong>{xp} XP</strong></span>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0 p-4 bg-white text-dark h-100 rounded-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiAward className="text-primary" /> Badges Collection ({badges.length})
              </h5>
              <div className="row g-2 overflow-auto" style={{ maxHeight: "170px" }}>
                {badgeList.map((badge) => {
                  const unlocked = badges.includes(badge.id);
                  return (
                    <div className="col-4 text-center mb-2" key={badge.id} title={`${badge.name}: ${badge.desc}`}>
                      <div 
                        className={`badge-icon-wrap rounded-circle p-2 mx-auto d-flex align-items-center justify-content-center ${unlocked ? "bg-primary bg-opacity-10 text-primary border border-primary" : "bg-light text-muted"}`} 
                        style={{ width: "50px", height: "50px", fontSize: "1.3rem", opacity: unlocked ? 1 : 0.45 }}
                      >
                        {badge.emoji}
                      </div>
                      <div className="small fw-semibold mt-1 text-truncate" style={{ fontSize: "0.7rem" }}>{badge.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 p-4 bg-white text-dark rounded-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2"><FiStar className="text-warning" /> Achievements & Quests</h5>
              <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: "300px" }}>
                {achievements.map((ach) => {
                  const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));
                  return (
                    <div key={ach.id} className={`p-3 rounded border ${ach.completed ? "bg-success bg-opacity-10" : "bg-light"}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-1">{ach.name}</h6>
                        <span className="badge bg-success bg-opacity-10 text-success">+{ach.xpReward} XP</span>
                      </div>
                      <p className="text-muted small mb-2">{ach.desc}</p>
                      <div className="progress" style={{ height: "6px" }}>
                        <div className={`progress-bar ${ach.completed ? "bg-success" : "bg-primary"}`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm border-0 p-4 bg-white text-dark rounded-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2"><FiAward className="text-warning" /> Global Leaderboard</h5>
              <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: "300px" }}>
                {leaderboard.map((item) => {
                  const isCurrentUser = item.name === user?.name;
                  return (
                    <div key={item.rank + "-" + item.name} className={`d-flex align-items-center justify-content-between p-2 px-3 border rounded ${isCurrentUser ? "bg-primary bg-opacity-10 text-primary border-primary" : ""}`}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold">{item.rank}</span>
                        <div className="profile-avatar" style={{ width: "32px", height: "32px" }}>{item.avatar}</div>
                        <span className="small fw-semibold">{item.name}</span>
                      </div>
                      <span className="small fw-bold">{item.xp} XP</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminTab = () => {
    if (user?.role !== "Admin") {
      return <div className="alert alert-danger">Access denied. Admin only.</div>;
    }

    const promoteUser = async (userId) => {
      try {
        await api.put(`/admin/users/${userId}/role`, { role: "Admin" });
        fetchAdminData();
        alert("User promoted to Admin successfully.");
      } catch (err) {
        console.error("Promote failed", err);
      }
    };

    const demoteUser = async (userId) => {
      try {
        await api.put(`/admin/users/${userId}/role`, { role: "User" });
        fetchAdminData();
        alert("User demoted to standard User successfully.");
      } catch (err) {
        console.error("Demote failed", err);
      }
    };

    const deleteUser = async (userId) => {
      if (window.confirm("Are you sure you want to delete this user and all their tasks permanently?")) {
        try {
          await api.delete(`/admin/users/${userId}`);
          fetchAdminData();
          alert("User deleted successfully.");
        } catch (err) {
          console.error("Delete user failed", err);
        }
      }
    };

    const handleBackupExport = async () => {
      try {
        const res = await api.get("/admin/backup");
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res.data, null, 2))}`;
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute("download", `smarttask_database_backup_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        logActivity("Downloaded database tasks backup file");
      } catch (err) {
        console.error("Backup failed", err);
      }
    };

    const handleRestoreImport = async (e) => {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (event) => {
        try {
          const parsedTasks = JSON.parse(event.target.result);
          await api.post("/admin/restore", { tasks: parsedTasks });
          fetchTasks();
          fetchAdminData();
          alert("Database successfully restored from JSON backup!");
          logActivity("Restored tasks database from JSON backup file");
        } catch (err) {
          alert("Restore failed. Please verify file integrity.");
        }
      };
    };

    return (
      <div className="admin-tab animate-fade-in">
        {/* Global Statistics */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card shadow-sm border-0 p-3 bg-white text-center">
              <span className="text-muted small">Total Accounts</span>
              <h3 className="fw-bold text-primary mt-1">{adminStats.totalUsers}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm border-0 p-3 bg-white text-center">
              <span className="text-muted small">Global Tasks Count</span>
              <h3 className="fw-bold text-dark mt-1">{adminStats.totalTasks}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm border-0 p-3 bg-white text-center">
              <span className="text-muted small">Completed Tasks</span>
              <h3 className="fw-bold text-success mt-1">{adminStats.completedTasks}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm border-0 p-3 bg-white text-center">
              <span className="text-muted small">Pending Tasks</span>
              <h3 className="fw-bold text-warning mt-1">{adminStats.pendingTasks}</h3>
            </div>
          </div>
        </div>

        {/* Database administration controls */}
        <div className="card shadow-sm p-4 border-0 bg-white rounded-4 mb-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <FiUpload className="text-primary" /> {t("backupRestore")}
          </h5>
          <p className="text-muted small">Maintain backup files of the smart task database. You can export or overwrite configurations.</p>
          <div className="d-flex gap-3 align-items-center mt-2 flex-wrap">
            <button className="btn btn-primary" onClick={handleBackupExport}>
              <FiDownload className="me-1" /> {t("backupBtn")}
            </button>
            <div>
              <label className="btn btn-outline-secondary mb-0 cursor-pointer">
                <FiUpload className="me-1" /> {t("restoreBtn")}
                <input 
                  type="file" 
                  accept=".json" 
                  style={{ display: "none" }} 
                  onChange={handleRestoreImport}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Registered Users database */}
        <div className="card shadow-sm p-4 border-0 bg-white rounded-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <FiUsers className="text-primary" /> {t("usersList")}
          </h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle small">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'Admin' ? 'bg-danger' : 'bg-secondary'}`}>{u.role || 'User'}</span></td>
                    <td>{u.level}</td>
                    <td>{u.xp} XP</td>
                    <td><span className={`badge ${u.isVerified ? 'bg-success' : 'bg-warning'}`}>{u.isVerified ? 'Verified' : 'Pending'}</span></td>
                    <td>
                      <div className="d-flex gap-1">
                        {u.role === "Admin" ? (
                          <button className="btn btn-xs btn-outline-warning py-1" onClick={() => demoteUser(u._id)} disabled={u._id === user?._id}>{t("demote")}</button>
                        ) : (
                          <button className="btn btn-xs btn-outline-danger py-1" onClick={() => promoteUser(u._id)}>{t("promote")}</button>
                        )}
                        <button className="btn btn-xs btn-light border text-danger py-1" onClick={() => deleteUser(u._id)} disabled={u._id === user?._id}>{t("delete")}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return t("dashboardTitle");
      case "tasks":
        return t("tasksWorkspace");
      case "analytics":
        return t("analyticsDashboard");
      case "calendar":
        return t("calendarSchedule");
      case "notifications":
        return "Inbox Notifications";
      case "history":
        return t("activityHistory");
      case "gamification":
        return t("questBoard");
      case "profile":
        return t("accountSettings");
      case "settings":
        return t("appPreferences");
      case "admin":
        return t("adminPanel");
      default:
        return "SmartTask Workspace";
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Alert */}
      {errorToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className="toast show align-items-center text-white bg-danger border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true" style={{ borderRadius: "10px" }}>
            <div className="d-flex p-2">
              <div className="toast-body fw-medium" style={{ whiteSpace: "pre-line" }}>
                {errorToast}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setErrorToast("")}></button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Top Header */}
      <div className="mobile-navbar">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <FiMenu />
        </button>
        <h1 className="mobile-brand">SmartTask</h1>
        <div className="mobile-avatar" style={{ background: avatarPresets[avatarIndex].bg }}>
          {avatarPresets[avatarIndex].emoji}
        </div>
      </div>

      {/* Left Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        isCollapsed={sidebarCollapsed}
        toggleCollapse={toggleSidebarCollapse}
        user={user}
        language={language}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notificationsCount={notifications.length}
          setActiveTab={setActiveTab}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        <div className="content-header align-items-start border-bottom">
          <div>
            <h2 className="fw-bold">{getHeaderTitle()}</h2>
            <span className="header-subtitle">
              {activeTab === "dashboard" && "Track your daily progress and manage your tasks efficiently."}
              {activeTab === "tasks" && "Stay organized, prioritize workflows, and complete tasks on time."}
              {activeTab === "analytics" && "Track your productivity, monitor task performance, and gain valuable insights."}
              {activeTab === "calendar" && "Plan your schedule, visualize timelines, and never miss a deadline."}
              {activeTab === "history" && "Review your recent task activity, system logs, and progress history."}
              {activeTab === "gamification" && "Complete challenges, earn XP, unlock achievements, and build your productivity streak!"}
              {activeTab === "profile" && "Manage your personal profile, details, and security credentials."}
              {activeTab === "settings" && "Customize your app settings, language, and system parameters."}
              {activeTab === "admin" && "Monitor platform users, task distribution, and system operations."}
              {activeTab === "notifications" && "Stay updated with recent alerts and task modifications."}
            </span>
          </div>
          <span className="current-date d-none d-md-inline mt-1 text-muted small fw-semibold">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Tab Body Contents */}
        <div className="content-body">
          {activeTab === "dashboard" && renderDashboardOverview()}
          {activeTab === "tasks" && renderTasksTab()}
          {activeTab === "analytics" && renderAnalyticsTab()}
          {activeTab === "calendar" && renderCalendarTab()}
          {activeTab === "notifications" && renderNotificationsTab()}
          {activeTab === "history" && renderHistoryTab()}
          {activeTab === "gamification" && renderGamificationTab()}
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "settings" && renderSettingsTab()}
          {activeTab === "admin" && renderAdminTab()}
        </div>

        {/* Premium Export PDF Modal */}
        <ExportPDFModal
          show={showExportModal}
          onHide={() => setShowExportModal(false)}
          tasks={tasks}
          filteredTasks={filteredTasks}
          user={user}
        />

        {/* Smart Task Assistant Chatbot */}
        <Chatbot fetchTasks={fetchTasks} fetchGamificationData={fetchGamificationData} user={user} />
      </main>
    </div>
  );
};

export default Dashboard;
