import { useEffect, useState } from "react";
import { ArrowLeft, Send, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminCreateNotice() {
    const navigate = useNavigate();

    const [hods, setHods] = useState([]);
    const [selectedHods, setSelectedHods] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loadingHods, setLoadingHods] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchHODs = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/admin/hods`,
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
                    setHods(data.hods);
                } else {
                    alert(data.message || "Unable to load HODs");
                }
            } catch (error) {
                console.error("Failed to fetch HODs:", error);
            } finally {
                setLoadingHods(false);
            }
        };

        fetchHODs();
    }, []);

    const toggleHOD = (hodId) => {
        setSelectedHods((current) => {
            if (current.includes(hodId)) {
                return current.filter((id) => id !== hodId);
            }

            return [...current, hodId];
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert("Please enter both title and content.");
            return;
        }

        if (selectedHods.length === 0) {
            alert("Please select at least one HOD.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch(
                `${API_URL}/admin/notices`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                            "cc_token"
                        )}`
                    },
                    body: JSON.stringify({
                        title: title.trim(),
                        content: content.trim(),
                        hodIds: selectedHods
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to create notice");
                return;
            }

            alert("Notice sent for HOD approval.");

            navigate("/admin/notices");
        } catch (error) {
            console.error("Failed to create notice:", error);
            alert("Unable to create notice.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <button
                        className="admin-back-button"
                        onClick={() => navigate("/admin/notices")}
                    >
                        <ArrowLeft size={17} />
                        Back to Notices
                    </button>

                    <h1>Create Notice</h1>

                    <p>
                        Create an official notice and send it to selected
                        HODs for verification.
                    </p>
                </div>
            </div>

            <form
                className="admin-create-notice-form"
                onSubmit={handleSubmit}
            >
                <div className="admin-form-section">
                    <label htmlFor="notice-title">
                        Notice Title
                    </label>

                    <input
                        id="notice-title"
                        type="text"
                        placeholder="Enter notice title"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                    />
                </div>

                <div className="admin-form-section">
                    <label htmlFor="notice-content">
                        Notice Content
                    </label>

                    <textarea
                        id="notice-content"
                        placeholder="Write the official notice..."
                        value={content}
                        onChange={(event) =>
                            setContent(event.target.value)
                        }
                        rows={10}
                    />
                </div>

                <div className="admin-form-section">
                    <div className="admin-form-label-row">
                        <label>Forward to HODs</label>

                        <span>
                            {selectedHods.length} selected
                        </span>
                    </div>

                    {loadingHods ? (
                        <div className="admin-hod-loading">
                            Loading HODs...
                        </div>
                    ) : hods.length === 0 ? (
                        <div className="admin-hod-empty">
                            No HODs available.
                        </div>
                    ) : (
                        <div className="admin-hod-list">
                            {hods.map((hod) => {
                                const selected =
                                    selectedHods.includes(
                                        hod.user_id
                                    );

                                return (
                                    <button
                                        type="button"
                                        key={hod.user_id}
                                        className={`admin-hod-option ${
                                            selected
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            toggleHOD(
                                                hod.user_id
                                            )
                                        }
                                    >
                                        <div>
                                            <strong>
                                                {hod.full_name}
                                            </strong>

                                            <span>
                                                {hod.department} ·{" "}
                                                {hod.email}
                                            </span>
                                        </div>

                                        {selected && (
                                            <Check size={20} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="admin-notice-submit-area">
                    <button
                        type="submit"
                        className="admin-submit-button"
                        disabled={submitting}
                    >
                        <Send size={17} />

                        {submitting
                            ? "Sending..."
                            : "Send for Approval"}
                    </button>
                </div>
            </form>
        </div>
    );
}