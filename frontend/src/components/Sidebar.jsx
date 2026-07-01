import { FiGrid, FiBarChart2, FiCheckSquare, FiMenu, FiCalendar, FiClock, FiAward, FiUsers } from "react-icons/fi";

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  isCollapsed, 
  toggleCollapse, 
  user,
  language = "English"
}) => {

  const sidebarTranslations = {
    English: {
      dashboard: "Dashboard",
      tasks: "Tasks",
      analytics: "Analytics",
      calendar: "Calendar",
      history: "Activity History",
      gamification: "Quest Board",
      admin: "Admin Panel"
    },
    Spanish: {
      dashboard: "Resumen",
      tasks: "Tareas",
      analytics: "Análisis",
      calendar: "Calendario",
      history: "Historial",
      gamification: "Misiones",
      admin: "Panel Admin"
    },
    Hindi: {
      dashboard: "डैशबोर्ड",
      tasks: "कार्य",
      analytics: "विश्लेषण",
      calendar: "कैलेंडर",
      history: "गतिविधि इतिहास",
      gamification: "खोज पट्ट",
      admin: "एडमिन पैनल"
    }
  };

  const t = sidebarTranslations[language] || sidebarTranslations["English"];

  const navItems = [
    { id: "dashboard", label: t.dashboard, icon: <FiGrid /> },
    { id: "tasks", label: t.tasks, icon: <FiCheckSquare /> },
    { id: "analytics", label: t.analytics, icon: <FiBarChart2 /> },
    { id: "calendar", label: t.calendar, icon: <FiCalendar /> },
    { id: "history", label: t.history, icon: <FiClock /> },
    { id: "gamification", label: t.gamification, icon: <FiAward /> },
  ];

  // Dynamically add Admin Panel if user is an Admin
  if (user?.role === "Admin") {
    navItems.push({ id: "admin", label: t.admin, icon: <FiUsers /> });
  }

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (setSidebarOpen) {
      setSidebarOpen(false); // Close drawer on mobile click
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`app-sidebar ${isCollapsed ? "collapsed" : ""} ${sidebarOpen ? "show" : ""}`}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
          <div>
            {/* Logo Area */}
            <div className="sidebar-header">
              {!isCollapsed && (
                <div className="sidebar-logo-group" onClick={() => setActiveTab("dashboard")}>
                  <div className="sidebar-logo-icon">
                    <FiCheckSquare />
                  </div>
                  <span className="sidebar-logo-text">SmartTask</span>
                </div>
              )}
              <button 
                className="sidebar-collapse-toggle" 
                onClick={toggleCollapse}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <FiMenu />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="sidebar-nav">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-link ${activeTab === item.id ? "active" : ""}`}
                  onClick={() => handleTabClick(item.id)}
                  title={isCollapsed ? item.label : ""}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
