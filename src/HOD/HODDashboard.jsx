import { useEffect, useState } from "react";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
const API_URL = "http://localhost:5000/api";
export default function HODDashboard() {
    const navigate = useNavigate();

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPendingNotices = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/hod/notices/pending`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "cc_token"
                            )}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setNotices(data.notices || []);
                }
            } catch (error) {
                console.error(
                    "Failed to fetch HOD notices:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPendingNotices();
    }, []);

    return (
        <div className="hod-page">
            <div className="hod-page-header">
                <div>
                    <h1>HOD Dashboard</h1>
                    <p>
                        Review and verify official college notices.
                    </p>
                </div>
            </div>

            <div className="hod-stats">
                <div className="hod-stat-card">
                    <div className="hod-stat-icon">
                        <Clock size={22} />
                    </div>

                    <div>
                        <span>Pending Notices</span>
                        <strong>{notices.length}</strong>
                    </div>
                </div>

                <div className="hod-stat-card">
                    <div className="hod-stat-icon">
                        <FileText size={22} />
                    </div>

                    <div>
                        <span>Assigned Notices</span>
                        <strong>{notices.length}</strong>
                    </div>
                </div>

                <div className="hod-stat-card">
                    <div className="hod-stat-icon">
                        <CheckCircle size={22} />
                    </div>

                    <div>
                        <span>Role</span>
                        <strong>HOD</strong>
                    </div>
                </div>
            </div>

            <div className="hod-section">
                <div className="hod-section-header">
                    <div>
                        <h2>Pending Approvals</h2>
                        <p>
                            Notices waiting for your verification.
                        </p>
                    </div>

                    <button
                        className="hod-view-all"
                        onClick={() =>
                            navigate("/hod/notices")
                        }
                    >
                        View All
                    </button>
                </div>

                {loading ? (
                    <div className="hod-empty-state">
                        Loading notices...
                    </div>
                ) : notices.length === 0 ? (
                    <div className="hod-empty-state">
                        No pending notices.
                    </div>
                ) : (
                    <div className="hod-notice-list">
                        {notices.slice(0, 3).map((notice) => (
                            <div
                                className="hod-notice-card"
                                key={notice.notice_id}
                            >
                                <div>
                                    <h3>{notice.title}</h3>

                                    <p>
                                        {notice.content.length > 150
                                            ? `${notice.content.substring(
                                                  0,
                                                  150
                                              )}...`
                                            : notice.content}
                                    </p>

                                    <span>
                                        Created by:{" "}
                                        {notice.admin_name}
                                    </span>
                                </div>

                                <button
                                    className="hod-review-button"
                                    onClick={() =>
                                        navigate(
                                            "/hod/notices"
                                        )
                                    }
                                >
                                    Review
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}