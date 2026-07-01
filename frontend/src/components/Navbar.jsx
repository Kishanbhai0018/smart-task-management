import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiSettings, FiChevronDown, FiSearch, FiBell, FiUser, FiSun, FiMoon } from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";

const Navbar = ({ searchQuery, setSearchQuery, notificationsCount, setActiveTab, isDark, toggleTheme }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    console.log("toggleDropdown called, current state:", dropdownOpen);
    setDropdownOpen(prev => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log("handleClickOutside: clicking outside, setting to false. Target:", event.target);
        setDropdownOpen(false);
      } else {
        console.log("handleClickOutside: clicking inside. Target:", event.target);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="dashboard-navbar">


      {/* Search Input Bar (only shown if user is logged in) */}
      {user && (
        <div className="navbar-search-wrapper">
          <FiSearch className="navbar-search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search tasks by title, desc..."
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {user && (
        <div className="navbar-right-actions">
          {/* Notifications Trigger */}
          <button 
            className="navbar-action-btn notif-btn" 
            onClick={() => setActiveTab("notifications")}
            title="View Notifications"
          >
            <FiBell />
            {notificationsCount > 0 && (
              <span className="navbar-badge">{notificationsCount}</span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="profile-container" ref={dropdownRef}>
            <button 
              className="profile-trigger" 
              onClick={toggleDropdown}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="profile-avatar">
                {getInitials(user.name)}
              </div>
              <span className="profile-name d-none d-sm-inline">{user.name}</span>
              <FiChevronDown className={`profile-chevron ${dropdownOpen ? "open" : ""}`} />
            </button>

            <div className={`profile-dropdown-menu ${dropdownOpen ? "show" : ""}`}>
              <div className="dropdown-user-details">
                <span className="dropdown-user-name">{user.name}</span>
                <span className="dropdown-user-email">{user.email || "No Email"}</span>
              </div>
              
              <button 
                className="dropdown-menu-item" 
                onClick={() => { setDropdownOpen(false); setActiveTab("profile"); }}
              >
                <FiUser className="dropdown-item-icon" />
                <span>My Profile</span>
              </button>

              <button 
                className="dropdown-menu-item" 
                onClick={() => { setDropdownOpen(false); setActiveTab("settings"); }}
              >
                <FiSettings className="dropdown-item-icon" />
                <span>Settings</span>
              </button>

              <button 
                className="dropdown-menu-item" 
                onClick={() => { setDropdownOpen(false); toggleTheme(); }}
              >
                {isDark ? <FiSun className="dropdown-item-icon" /> : <FiMoon className="dropdown-item-icon" />}
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>
              
              <hr style={{ margin: "0.25rem 0", opacity: 0.08 }} />
              
              <button className="dropdown-menu-item logout" onClick={handleLogout}>
                <FiLogOut className="dropdown-item-icon" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
