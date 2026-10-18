import { NavLink, Link, Outlet } from "react-router-dom";
import {
  Bell,
  Compass,
  ChevronDown,
  ChevronRight,
  Home as HomeIcon,
  Newspaper,
  TrendingUp,
  Users,
  Search,
  MessageCircle,
  LogOut
} from "lucide-react";
import { useEffect, useState } from "react";
import { communities } from "./data";

const API_URL = "http://localhost:5000/api";

export default function Layout() {
  const [open, setOpen] = useState(true);
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
        console.error("Unable to load navbar profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_user");

    window.location.href = "/login";
  };

  const navigation = [
    [HomeIcon, "Home", "/home"],
    [TrendingUp, "Popular", "/popular"],
    [Newspaper, "Notices", "/notices"],
    [Compass, "Explore", "/explore"],
    [MessageCircle, "Messages", "/chat"]
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
    : "CC";

  return (
    <div className="app">
      <header className="navbar">

        <Link to="/home" className="brand">
          <b>C</b>
          <span>CampusConnect</span>
        </Link>

        <div className="search">
          <Search size={18} />
          <input placeholder="Search CampusConnect..." />
        </div>

        <div className="actions">

          <button
            className="navicon"
            aria-label="Notifications"
            type="button"
          >
            <Bell size={20} />
          </button>

          <Link to="/profile" className="profile">
            <span>{initials}</span>
            {profile?.full_name || "My Profile"}
            <span className="profile-arrow">⌄</span>
          </Link>

        </div>
      </header>

      <div className="workspace">

        <aside className="sidebar">

          <nav>
            {navigation.map(([Icon, name, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive ? "nav active" : "nav"
                }
              >
                <Icon size={20} />
                {name}
              </NavLink>
            ))}
          </nav>

          <hr />

          <button
            className="section"
            onClick={() => setOpen(!open)}
            type="button"
          >
            <span>COMMUNITIES</span>

            {open ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {open && (
            <div className="community-list">

              {communities.map((community) => (
                <Link
                  key={community.id}
                  to={`/communities/${community.id}`}
                  className="community"
                >
                  <span>{community.short}</span>
                  {community.name}
                </Link>
              ))}

              <button
                className="discover"
                type="button"
              >
                <Users size={17} />
                Discover Communities
              </button>

            </div>
          )}

          <div className="sidebar-bottom">

            <button
              className="logout-button"
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={20} />
              Logout
            </button>

          </div>

        </aside>

        <main>
          <Outlet />
        </main>

        <div className="right-space" />

      </div>
    </div>
  );
}