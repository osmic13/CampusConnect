import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./Layout";
import Home from "./Home";
import Popular from "./Popular";
import Notices from "./Notices";
import Explore from "./Explore";
import Community from "./Community";
import Auth from "./Auth";
import Profile from "./Profile";
import Opportunities from "./Opportunities";
import Chat from "./Chat";
import Documents from "./Documents";

import AdminLayout from "./Admin/AdminLayout";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminUsers from "./Admin/AdminUsers";
import AdminNotices from "./Admin/AdminNotices";
import AdminCreateNotice from "./Admin/AdminCreateNotice";
import HODLayout from "./HOD/HODLayout";
import HODDashboard from "./HOD/HODDashboard";
import HODNotices from "./HOD/HODNotices";

function getUserRole() {
    const user = localStorage.getItem("cc_user");

    if (!user) {
        return null;
    }

    try {
        const parsedUser = JSON.parse(user);
        return parsedUser?.role || null;
    } catch (error) {
        return null;
    }
}

function RootRedirect() {
    const token = localStorage.getItem("cc_token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const role = getUserRole();

    if (role === "ADMIN") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === "HOD") {
        return <Navigate to="/hod/dashboard" replace />;
    }

    return <Navigate to="/home" replace />;
}

export default function App() {
    return (
        <Routes>

            {/* AUTH */}

            <Route
                path="/login"
                element={<Auth />}
            />

            <Route
                path="/forgot-password"
                element={<Auth initialMode="forgot" />}
            />

            <Route
                path="/change-password"
                element={<Auth initialMode="change" />}
            />

            {/* ROOT */}

            <Route
                path="/"
                element={<RootRedirect />}
            />

            {/* ADMIN */}

            <Route
                path="/admin/*"
                element={
                    <AdminLayout>
                        <Routes>

                            <Route
                                path="dashboard"
                                element={<AdminDashboard />}
                            />

                            <Route
                                path="users"
                                element={<AdminUsers />}
                            />

                            <Route
                                path="notices"
                                element={<AdminNotices />}
                            />

                            <Route
                                path="notices/create"
                                element={<AdminCreateNotice />}
                            />

                            <Route
                                path="opportunities"
                                element={
                                    <div className="admin-page">
                                        <div className="admin-page-header">
                                            <div>
                                                <h1>Opportunities</h1>

                                                <p>
                                                    Opportunity management
                                                    will be added here.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            <Route
                                path="account"
                                element={
                                    <div className="admin-page">
                                        <div className="admin-page-header">
                                            <div>
                                                <h1>Account</h1>

                                                <p>
                                                    Manage your administrator
                                                    account.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            <Route
                                path="*"
                                element={
                                    <Navigate
                                        to="/admin/dashboard"
                                        replace
                                    />
                                }
                            />

                        </Routes>
                    </AdminLayout>
                }
            />

            {/* HOD */}

            <Route
                path="/hod/*"
                element={
                    <HODLayout>
                        <Routes>
                            <Route
                                path="dashboard"
                                element={<HODDashboard />}
                            />

                            <Route
                                path="notices"
                                element={<HODNotices />}
                            />

                            <Route
                                path="documents"
                                element={<Documents />}
                            />

                            <Route
                                path="profile"
                                element={
                                    <div className="hod-page">
                                        <div className="hod-page-header">
                                            <div>
                                                <h1>Profile</h1>
                                                <p>
                                                    Manage your HOD account.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            <Route
                                path="*"
                                element={
                                    <Navigate
                                        to="/hod/dashboard"
                                        replace
                                    />
                                }
                            />
                        </Routes>
                    </HODLayout>
                }
            />

            {/* STUDENT */}

            <Route element={<Layout />}>

                <Route
                    path="home"
                    element={<Home />}
                />

                <Route
                    path="popular"
                    element={<Popular />}
                />

                <Route
                    path="notices"
                    element={<Notices />}
                />

                <Route
                    path="explore"
                    element={<Explore />}
                />

                <Route
                    path="opportunities"
                    element={<Opportunities />}
                />

                <Route
                    path="profile"
                    element={<Profile />}
                />

                <Route
                    path="chat"
                    element={<Chat />}
                />

                <Route
                    path="documents"
                    element={<Documents />}
                />

                <Route
                    path="communities/:id"
                    element={<Community />}
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/home"
                            replace
                        />
                    }
                />

            </Route>

        </Routes>
    );
}