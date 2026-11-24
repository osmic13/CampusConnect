import {
  CheckCircle2,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getReactionSocket } from "./utils/reactionSocket";

const API_URL = import.meta.env.VITE_API_URL;

export default function PostCard({ p }) {
  const [reaction, setReaction] = useState(p.myReaction ?? null);
  const [likes, setLikes] = useState(Number(p.likes ?? 0));
  const [dislikes, setDislikes] = useState(Number(p.dislikes ?? 0));
  const [isReacting, setIsReacting] = useState(false);
  const [reactionError, setReactionError] = useState("");

  useEffect(() => {
    setLikes(Number(p.likes ?? 0));
    setDislikes(Number(p.dislikes ?? 0));
    setReaction(p.myReaction ?? null);
  }, [p.likes, p.dislikes, p.myReaction]);

  useEffect(() => {
    const socket = getReactionSocket();

    if (!socket || !p.targetType || !p.targetId) {
      return undefined;
    }

    const handleReactionUpdated = (update) => {
      if (
        update.targetType !== p.targetType ||
        Number(update.targetId) !== Number(p.targetId)
      ) {
        return;
      }

      setLikes(Number(update.likes ?? 0));
      setDislikes(Number(update.dislikes ?? 0));
      // The broadcast's myReaction belongs to the user who clicked.
      // Each viewer's own reaction is updated by their API response.
    };

    socket.on("reaction_updated", handleReactionUpdated);

    return () => {
      socket.off("reaction_updated", handleReactionUpdated);
    };
  }, [p.targetType, p.targetId]);

  async function react(type) {
    if (isReacting) return;

    if (!p.targetType || !p.targetId) {
      setReactionError("Reaction is unavailable for this item.");
      return;
    }

    const targetId = Number(p.targetId);
    if (!Number.isSafeInteger(targetId) || targetId <= 0) {
      setReactionError("Invalid post or notice ID.");
      return;
    }

    const token = localStorage.getItem("cc_token");
    if (!token) {
      setReactionError("Please log in to react.");
      return;
    }

    const reactionType = type === "like" ? "LIKE" : "DISLIKE";
    setIsReacting(true);
    setReactionError("");

    try {
      const response = await fetch(
        `${API_URL}/reactions/${p.targetType}/${targetId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reactionType }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to update reaction.");
      }

      setLikes(Number(data.likes ?? 0));
      setDislikes(Number(data.dislikes ?? 0));
      setReaction(data.myReaction ?? null);
    } catch (error) {
      console.error("REACTION REQUEST ERROR:", error);
      setReactionError(error.message || "Unable to update reaction.");
    } finally {
      setIsReacting(false);
    }
  }

  let type = "UPDATE";

  if (p.type === "notice") {
    type = "NOTICE";
  } else if (p.type === "opportunity") {
    type = p.title.includes("Hackathon") ? "HACKATHON" : "INTERNSHIP";
  } else if (p.type === "club") {
    type = "EVENT";
  }

  return (
    <article className="post">
      <div className="posthead">
        <div className="avatar">
          {p.author === "Graphic Era University"
            ? "GE"
            : p.author.slice(0, 2).toUpperCase()}
        </div>

        <div>
          <div className="author">
            {p.author}
            {p.author && <CheckCircle2 size={14} />}
          </div>
          <div className="meta">
            {p.meta} · {p.time}
          </div>
        </div>

        <button className="dots">•••</button>
      </div>

      <div className="content">
        <span className="tag">{type}</span>
        <h2>{p.title}</h2>
        <p>{p.body}</p>

        {p.org && (
          <div className="opmeta">
            <small>ORGANIZATION</small>
            <b>{p.org}</b>
            <span>{p.details}</span>
          </div>
        )}

        {p.skills && (
          <div className="skills">
            {p.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}

        {p.file && (
          <button className="file">
            <FileText size={19} />
            <span>
              <b>{p.file}</b>
              <small>{p.fileMeta}</small>
            </span>
            <strong>→</strong>
          </button>
        )}
      </div>

      <div className="footer">
        <button
          className={reaction === "LIKE" ? "react selected" : "react"}
          onClick={() => react("like")}
          disabled={isReacting}
          aria-label="Like"
          aria-pressed={reaction === "LIKE"}
        >
          <ThumbsUp size={16} />
          {likes}
        </button>

        <button
          className={reaction === "DISLIKE" ? "react selected" : "react"}
          onClick={() => react("dislike")}
          disabled={isReacting}
          aria-label="Dislike"
          aria-pressed={reaction === "DISLIKE"}
        >
          <ThumbsDown size={16} />
          {dislikes}
        </button>
      </div>

      {reactionError && (
        <p className="feed-status error" role="alert">
          {reactionError}
        </p>
      )}
    </article>
  );
}
