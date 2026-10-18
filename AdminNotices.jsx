import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Search } from "lucide-react";

export default function AdminNotices() {
    const [notices, setNotices] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchNotices = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/admin/notices",
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
                setNotices(data.notices);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Failed to fetch notices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const updateVerification = async (postId, isVerified) => {
        try {
            setUpdatingId(postId);

            const response = await fetch(
                `http://localhost:5000/api/admin/notices/${postId}/verification`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                            "cc_token"
                        )}`
                    },
                    body: JSON.stringify({
                        isVerified: isVerified
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to update notice");
                return;
            }

            setNotices((currentNotices) =>
                currentNotices.map((notice) =>
                    notice.post_id === postId
                        ? {
                              ...notice,
                              is_verified: isVerified ? 1 : 0
                          }
                        : notice
                )
            );
        } catch (error) {
            console.error(
                "Failed to update notice verification:",
                error
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredNotices = notices.filter((notice) => {
        const searchValue = search.toLowerCase();

        return (
            notice.title.toLowerCase().includes(searchValue) ||
            notice.content.toLowerCase().includes(searchValue) ||
            notice.author_name?.toLowerCase().includes(searchValue) ||
            notice.author_email?.toLowerCase().includes(searchValue)
        );
    });

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Notices</h1>
                    <p>
                        Manage official college notices and their
                        verification status.
                    </p>
                </div>
            </div>

            <div className="admin-search-box">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search notices..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />
            </div>

            {loading ? (
                <div className="admin-empty-state">
                    Loading notices...
                </div>
            ) : filteredNotices.length === 0 ? (
                <div className="admin-empty-state">
                    No notices found.
                </div>
            ) : (
                <div className="admin-notices-list">
                    {filteredNotices.map((notice) => (
                        <div
                            className="admin-notice-card"
                            key={notice.post_id}
                        >
                            <div className="admin-notice-main">
                                <div className="admin-notice-top">
                                    <span className="admin-notice-type">
                                        OFFICIAL NOTICE
                                    </span>

                                    {notice.is_verified ? (
                                        <span className="admin-status verified">
                                            <CheckCircle size={15} />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="admin-status unverified">
                                            <XCircle size={15} />
                                            Unverified
                                        </span>
                                    )}
                                </div>

                                <h2>{notice.title}</h2>

                                <p className="admin-notice-content">
                                    {notice.content}
                                </p>

                                <div className="admin-notice-meta">
                                    <span>
                                        <strong>Author:</strong>{" "}
                                        {notice.author_name ||
                                            "Unknown"}
                                    </span>

                                    <span>
                                        <strong>Role:</strong>{" "}
                                        {notice.author_role}
                                    </span>

                                    <span>
                                        <strong>Email:</strong>{" "}
                                        {notice.author_email}
                                    </span>

                                    <span>
                                        <strong>Posted:</strong>{" "}
                                        {new Date(
                                            notice.created_at
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="admin-notice-actions">
                                {notice.is_verified ? (
                                    <button
                                        className="admin-action-button unverify"
                                        disabled={
                                            updatingId ===
                                            notice.post_id
                                        }
                                        onClick={() =>
                                            updateVerification(
                                                notice.post_id,
                                                false
                                            )
                                        }
                                    >
                                        <XCircle size={16} />
                                        {updatingId ===
                                        notice.post_id
                                            ? "Updating..."
                                            : "Remove Verification"}
                                    </button>
                                ) : (
                                    <button
                                        className="admin-action-button verify"
                                        disabled={
                                            updatingId ===
                                            notice.post_id
                                        }
                                        onClick={() =>
                                            updateVerification(
                                                notice.post_id,
                                                true
                                            )
                                        }
                                    >
                                        <CheckCircle size={16} />
                                        {updatingId ===
                                        notice.post_id
                                            ? "Updating..."
                                            : "Verify Notice"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}