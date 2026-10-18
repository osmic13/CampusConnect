import {
  CheckCircle2,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useState } from "react";

export default function PostCard({ p }) {
  const [reaction, setReaction] = useState(null);
  const [likes, setLikes] = useState(p.likes);
  const [dislikes, setDislikes] = useState(p.dislikes);

  function react(type) {
    if (reaction === type) {
      if (type === "like") {
        setLikes((value) => value - 1);
      } else {
        setDislikes((value) => value - 1);
      }

      setReaction(null);
      return;
    }

    if (reaction === "like") {
      setLikes((value) => value - 1);
    }

    if (reaction === "dislike") {
      setDislikes((value) => value - 1);
    }

    if (type === "like") {
      setLikes((value) => value + 1);
    } else {
      setDislikes((value) => value + 1);
    }

    setReaction(type);
  }

  let type = "UPDATE";

  if (p.type === "notice") {
    type = "NOTICE";
  } else if (p.type === "opportunity") {
    type = p.title.includes("Hackathon")
      ? "HACKATHON"
      : "INTERNSHIP";
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
          className={
            reaction === "like" ? "react selected" : "react"
          }
          onClick={() => react("like")}
        >
          <ThumbsUp size={16} />
          {likes}
        </button>

        <button
          className={
            reaction === "dislike" ? "react selected" : "react"
          }
          onClick={() => react("dislike")}
        >
          <ThumbsDown size={16} />
          {dislikes}
        </button>
      </div>
    </article>
  );
}
