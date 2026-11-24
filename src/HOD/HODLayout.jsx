import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    FileCheck2,
    User,
    LogOut
} from "lucide-react";
import "./HOD.css";

export default function HODLayout({ children }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("cc_token");
        localStorage.removeItem("cc_user");
        navigate("/login");
    };

    return (
        <div className="hod-app">
            <aside className="hod-sidebar">
                <div className="hod-brand">
                    <h2>CampusConnect</h2>
                    <span>HOD Portal</span>
                </div>

                <nav className="hod-nav">
                    <NavLink to="/hod/dashboard">
                        <LayoutDashboard size={19} />
                        Dashboard
                    </NavLink>

                    <NavLink to="/hod/notices">
                        <FileText size={19} />
                        Notices
                    </NavLink>

                    <NavLink to="/hod/documents">
                        <FileCheck2 size={19} />
                        Documents
                    </NavLink>

                    <NavLink to="/hod/profile">
                        <User size={19} />
                        Profile
                    </NavLink>
                </nav>

                <button
                    className="hod-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={19} />
                    Logout
                </button>
            </aside>

            <main className="hod-main">
                {children}
            </main>
        </div>
    );
}