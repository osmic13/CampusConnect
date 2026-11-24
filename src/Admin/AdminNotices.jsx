import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Plus,
    Send,
    Edit
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminNotices() {
    const navigate = useNavigate();

    const [notices, setNotices] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchNotices = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/admin/notices`,
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

    const getStatusLabel = (status) => {
        if (status === "PENDING_APPROVAL") {
            return "Pending HOD Review";
        }

        if (status === "APPROVED") {
            return "Approved";
        }

        if (status === "REJECTED") {
            return "Rejected";
        }

        if (status === "PUBLISHED") {
            return "Published";
        }

        if (status === "DRAFT") {
            return "Draft";
        }

        return status;
    };

    const getStatusClass = (status) => {
        if (status === "APPROVED") {
            return "approved";
        }

        if (status === "PUBLISHED") {
            return "published";
        }

        if (status === "REJECTED") {
            return "rejected";
        }

        if (status === "PENDING_APPROVAL") {
            return "pending";
        }

        return "draft";
    };

    const getStatusIcon = (status) => {
        if (status === "APPROVED") {
            return <CheckCircle size={15} />;
        }

        if (status === "PUBLISHED") {
            return <Send size={15} />;
        }

        if (status === "REJECTED") {
            return <XCircle size={15} />;
        }

        return <Clock size={15} />;
    };

    const getApprovalSummary = (notice) => {
        const reviews = notice.reviews || [];

        if (reviews.length === 0) {
            return "No HOD assigned";
        }

        const approved = reviews.filter(
            (review) =>
                review.status === "APPROVED"
        ).length;

        const rejected = reviews.filter(
            (review) =>
                review.status === "REJECTED"
        ).length;

        const pending = reviews.filter(
            (review) =>
                review.status === "PENDING"
        ).length;

        if (rejected > 0) {
            return `${approved} approved • ${rejected} rejected`;
        }

        if (pending > 0) {
            return `${approved} approved • ${pending} pending`;
        }

        return `${approved}/${reviews.length} HODs approved`;
    };

    const filteredNotices = notices.filter(
        (notice) => {
            const searchValue =
                search.toLowerCase();

            const title =
                notice.title?.toLowerCase() || "";

            const content =
                notice.content?.toLowerCase() || "";

            const creator =
                notice.creator_name?.toLowerCase() ||
                "";

            const hodNames =
                (notice.reviews || [])
                    .map(
                        (review) =>
                            review.hod_name?.toLowerCase() ||
                            ""
                    )
                    .join(" ");

            return (
                title.includes(searchValue) ||
                content.includes(searchValue) ||
                creator.includes(searchValue) ||
                hodNames.includes(searchValue)
            );
        }
    );

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Notices</h1>

                    <p>
                        Manage official college notices,
                        HOD approvals and publication.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-submit-button"
                    onClick={() =>
                        navigate(
                            "/admin/notices/create"
                        )
                    }
                >
                    <Plus size={17} />
                    Create Notice
                </button>
            </div>

            <div className="admin-search-box">
                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search notices..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
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
                    {filteredNotices.map(
                        (notice) => (
                            <div
                                className="admin-notice-card"
                                key={notice.notice_id}
                            >
                                <div className="admin-notice-main">
                                    <div className="admin-notice-top">
                                        <span className="admin-notice-type">
                                            OFFICIAL NOTICE
                                        </span>

                                        <span
                                            className={`admin-status ${getStatusClass(
                                                notice.status
                                            )}`}
                                        >
                                            {getStatusIcon(
                                                notice.status
                                            )}

                                            {getStatusLabel(
                                                notice.status
                                            )}
                                        </span>
                                    </div>

                                    <h2>
                                        {notice.title}
                                    </h2>

                                    <p className="admin-notice-content">
                                        {notice.content}
                                    </p>

                                    <div className="admin-notice-meta">
                                        <span>
                                            <strong>
                                                Created by:
                                            </strong>{" "}
                                            {notice.creator_name ||
                                                "Unknown"}
                                        </span>

                                        <span>
                                            <strong>
                                                HOD Review:
                                            </strong>{" "}
                                            {getApprovalSummary(
                                                notice
                                            )}
                                        </span>

                                        <span>
                                            <strong>
                                                Created:
                                            </strong>{" "}
                                            {new Date(
                                                notice.created_at
                                            ).toLocaleDateString()}
                                        </span>

                                        {notice.published_at && (
                                            <span>
                                                <strong>
                                                    Published:
                                                </strong>{" "}
                                                {new Date(
                                                    notice.published_at
                                                ).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="admin-hod-review-list">
                                        <strong>
                                            HOD Reviews
                                        </strong>

                                        {notice.reviews &&
                                        notice.reviews.length >
                                            0 ? (
                                            notice.reviews.map(
                                                (
                                                    review
                                                ) => (
                                                    <div
                                                        className="admin-hod-review"
                                                        key={
                                                            review.review_id
                                                        }
                                                    >
                                                        <div>
                                                            <strong>
                                                                {
                                                                    review.hod_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {review.hod_department ||
                                                                    "Department"}
                                                            </span>
                                                        </div>

                                                        <span
                                                            className={`admin-review-status ${review.status.toLowerCase()}`}
                                                        >
                                                            {review.status ===
                                                            "APPROVED" ? (
                                                                <CheckCircle
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            ) : review.status ===
                                                              "REJECTED" ? (
                                                                <XCircle
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            ) : (
                                                                <Clock
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            )}

                                                            {
                                                                review.status
                                                            }
                                                        </span>

                                                        {review.remarks && (
                                                            <p>
                                                                <strong>
                                                                    Reason:
                                                                </strong>{" "}
                                                                {
                                                                    review.remarks
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <span className="admin-no-reviews">
                                                No HOD reviews
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="admin-notice-actions">
                                    {notice.status ===
                                        "REJECTED" && (
                                        <button
                                            className="admin-action-button verify"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/notices/edit/${notice.notice_id}`
                                                )
                                            }
                                        >
                                            <Edit
                                                size={16}
                                            />
                                            Edit & Resubmit
                                        </button>
                                    )}

                                    {notice.status ===
                                        "PENDING_APPROVAL" && (
                                        <button
                                            className="admin-action-button"
                                            disabled
                                        >
                                            <Clock
                                                size={16}
                                            />
                                            Waiting for HOD
                                        </button>
                                    )}

                                    {notice.status ===
                                        "PUBLISHED" && (
                                        <button
                                            className="admin-action-button"
                                            disabled
                                        >
                                            <CheckCircle
                                                size={16}
                                            />
                                            Published
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}