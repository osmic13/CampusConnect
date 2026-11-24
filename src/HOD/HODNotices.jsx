import { useEffect, useState } from "react";
import {
    CheckCircle,
    XCircle,
    FileText
} from "lucide-react";

const API_URL = "http://localhost:5000/api";
export default function HODNotices() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const [rejectingNotice, setRejectingNotice] = useState(null);
    const [remarks, setRemarks] = useState("");

    const fetchNotices = async () => {
        try {
            setLoading(true);

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

            if (!response.ok) {
                alert(
                    data.message ||
                    "Unable to fetch pending notices"
                );
                return;
            }

            setNotices(data.notices || []);
        } catch (error) {
        console.error("Failed to fetch notices:", error);
        alert(`Request failed: ${error.message}`);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchNotices();
}, []);

const approveNotice = async (noticeId) => {
    try {
        setProcessingId(noticeId);

        const response = await fetch(
            `${API_URL}/hod/notices/${noticeId}/review`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                        "cc_token"
                    )}`
                },
                body: JSON.stringify({
                    status: "APPROVED",
                    remarks:
                        "Verified and approved by HOD."
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.message ||
                "Unable to approve notice"
            );
            return;
        }

        alert(data.message);

        setNotices((current) =>
            current.filter(
                (notice) =>
                    notice.notice_id !== noticeId
            )
        );
    } catch (error) {
        console.error(
            "Failed to approve notice:",
            error
        );

        alert("Unable to approve notice.");
    } finally {
        setProcessingId(null);
    }
};

const openRejectDialog = (notice) => {
    setRejectingNotice(notice);
    setRemarks("");
};

const rejectNotice = async () => {
    if (!remarks.trim()) {
        alert("Please enter a rejection reason.");
        return;
    }

    const noticeId = rejectingNotice.notice_id;

    try {
        setProcessingId(noticeId);

        const response = await fetch(
            `${API_URL}/hod/notices/${noticeId}/review`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                        "cc_token"
                    )}`
                },
                body: JSON.stringify({
                    status: "REJECTED",
                    remarks: remarks.trim()
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.message ||
                "Unable to reject notice"
            );
            return;
        }

        alert(data.message);

        setNotices((current) =>
            current.filter(
                (notice) =>
                    notice.notice_id !== noticeId
            )
        );

        setRejectingNotice(null);
        setRemarks("");
    } catch (error) {
        console.error(
            "Failed to reject notice:",
            error
        );

        alert("Unable to reject notice.");
    } finally {
        setProcessingId(null);
    }
};

return (
    <div className="hod-page">
        <div className="hod-page-header">
            <div>
                <h1>Pending Notices</h1>
                <p>
                    Review official notices forwarded to you.
                </p>
            </div>

            <div className="hod-pending-count">
                <FileText size={18} />
                {notices.length} pending
            </div>
        </div>

        {loading ? (
            <div className="hod-empty-state">
                Loading notices...
            </div>
        ) : notices.length === 0 ? (
            <div className="hod-empty-state">
                <CheckCircle size={40} />

                <h3>No pending notices</h3>

                <p>
                    You have no notices waiting for
                    verification.
                </p>
            </div>
        ) : (
            <div className="hod-notice-list">
                {notices.map((notice) => {
                    const processing =
                        processingId ===
                        notice.notice_id;

                    return (
                        <div
                            className="hod-full-notice-card"
                            key={notice.notice_id}
                        >
                            <div className="hod-notice-content">
                                <div className="hod-notice-meta">
                                    <span>
                                        Notice #
                                        {notice.notice_id}
                                    </span>

                                    <span>
                                        {new Date(
                                            notice.created_at
                                        ).toLocaleString()}
                                    </span>
                                </div>

                                <h2>{notice.title}</h2>

                                <p className="hod-notice-body">
                                    {notice.content}
                                </p>

                                <div className="hod-notice-author">
                                    <strong>
                                        Created by:
                                    </strong>{" "}
                                    {notice.admin_name}
                                </div>
                            </div>

                            <div className="hod-notice-actions">
                                <button
                                    className="hod-approve-button"
                                    disabled={processing}
                                    onClick={() =>
                                        approveNotice(
                                            notice.notice_id
                                        )
                                    }
                                >
                                    <CheckCircle
                                        size={17}
                                    />

                                    {processing
                                        ? "Processing..."
                                        : "Approve"}
                                </button>

                                <button
                                    className="hod-reject-button"
                                    disabled={processing}
                                    onClick={() =>
                                        openRejectDialog(
                                            notice
                                        )
                                    }
                                >
                                    <XCircle size={17} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {rejectingNotice && (
            <div className="hod-modal-overlay">
                <div className="hod-modal">
                    <h2>Reject Notice</h2>

                    <p>
                        Please provide a reason for rejecting
                        this notice.
                    </p>

                    <textarea
                        value={remarks}
                        onChange={(event) =>
                            setRemarks(
                                event.target.value
                            )
                        }
                        placeholder="Enter rejection reason..."
                        rows={5}
                    />

                    <div className="hod-modal-actions">
                        <button
                            className="hod-cancel-button"
                            onClick={() =>
                                setRejectingNotice(null)
                            }
                        >
                            Cancel
                        </button>

                        <button
                            className="hod-reject-button"
                            disabled={
                                processingId ===
                                rejectingNotice.notice_id
                            }
                            onClick={rejectNotice}
                        >
                            <XCircle size={17} />
                            Confirm Rejection
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
}