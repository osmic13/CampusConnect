import "./Admin.css";
import { NavLink, Link } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Newspaper,
  BriefcaseBusiness,
  Settings,
  Bell,
  LogOut
} from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function AdminLayout({ children }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("cc_token");

      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) return;

        const data = await response.json();
        setProfile(data.profile);
      } catch (error) {
        console.error("Unable to load admin profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const navigation = [
    [LayoutDashboard, "Dashboard", "/admin/dashboard"],
    [Users, "Users", "/admin/users"],
    [Newspaper, "Notices", "/admin/notices"],
    [BriefcaseBusiness, "Opportunities", "/admin/opportunities"]
  ];

  const initials = profile?.full_name
    ? profile.full_name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CA";

  const handleLogout = () => {
    localStorage.removeItem("cc_token");
    window.location.href = "/login";
  };

  return (
    <div className="admin-app">
      <header className="admin-navbar">
        <Link to="/admin/dashboard" className="admin-brand">
          <span className="admin-brand-mark">C</span>

          <div>
            <strong>CampusConnect</strong>
            <small>Administration</small>
          </div>
        </Link>

        <div className="admin-navbar-actions">
          <button
            type="button"
            className="admin-icon-button"
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>

          <Link to="/admin/account" className="admin-account">
            <span className="admin-avatar">{initials}</span>

            <span className="admin-account-info">
              <strong>{profile?.full_name || "CampusConnect Admin"}</strong>
              <small>Administrator</small>
            </span>
          </Link>
        </div>
      </header>

      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-label">
            ADMINISTRATION
          </div>

          <nav className="admin-navigation">
            {navigation.map(([Icon, name, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive
                    ? "admin-nav active"
                    : "admin-nav"
                }
              >
                <Icon size={19} />
                <span>{name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="admin-sidebar-bottom">
            <NavLink
              to="/admin/account"
              className={({ isActive }) =>
                isActive
                  ? "admin-nav active"
                  : "admin-nav"
              }
            >
              <Settings size={19} />
              <span>Account</span>
            </NavLink>

            <button
              type="button"
              className="admin-nav admin-logout"
              onClick={handleLogout}
            >
              <LogOut size={19} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}