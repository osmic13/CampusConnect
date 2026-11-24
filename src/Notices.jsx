import { useEffect, useState } from "react";
import Feed from "./Feed";
import { Page } from "./Home";

const API_URL = import.meta.env.VITE_API_URL;

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem("cc_token");

        const response = await fetch(`${API_URL}/notices/published`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notices");
        }

        const data = await response.json();

        const formattedNotices = data.notices.map((notice) => ({
          id: `notice-${notice.notice_id}`,
          type: "notice",
          author: "Graphic Era University",
          meta: "Official Announcement",
          time: new Date(
            notice.published_at || notice.created_at
          ).toLocaleDateString(),
          title: notice.title,
          body: notice.content,

          // Reaction data returned by the backend
          likes: Number(notice.likes ?? 0),
          dislikes: Number(notice.dislikes ?? 0),
          myReaction: notice.my_reaction ?? null,

          // Keep the numeric database ID separate from the display ID
          targetType: "NOTICE",
          targetId: notice.notice_id,

          communities: [],
        }));

        setNotices(formattedNotices);
      } catch (error) {
        console.error(error);
        setError("Unable to load notices.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <>
      <Page
        title="Notices"
        desc="Official college announcements, newest first."
        filters={[
          "All",
          "Academic",
          "Examination",
          "Placement",
          "Events",
        ]}
      />

      {loading && (
        <p className="feed-status">
          Loading notices...
        </p>
      )}

      {error && (
        <p className="feed-status error">
          {error}
        </p>
      )}

      {!loading && !error && notices.length === 0 && (
        <p className="feed-status">
          No published notices available.
        </p>
      )}

      {!loading && !error && (
        <Feed posts={notices} />
      )}
    </>
  );
}
