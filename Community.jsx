import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  Users,
  BellOff,
  MoreHorizontal,
} from "lucide-react";
import { getCommunity, posts } from "./data";
import Feed from "./Feed";

export default function Community() {
  const { id } = useParams();
  const community = getCommunity(id);
  const [joined, setJoined] = useState(true);

  if (!community) {
    return <div>Community not found.</div>;
  }

  return (
    <section className="community-page">
      <div className="banner">
        <span>CAMPUSCONNECT</span>
      </div>

      <div className="identity">
        <div className="large-avatar">{community.short}</div>

        <div className="community-title">
          <h1>
            {community.name}
            <CheckCircle2 size={19} />
          </h1>
          <p>{community.type}</p>
        </div>

        <div className="community-actions">
          <button onClick={() => setJoined(!joined)}>
            {joined ? "Joined ✓" : "Join"}
          </button>

          <button>
            <BellOff size={18} />
          </button>

          <button>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className="active">Posts</button>
        <button>Announcements</button>
        <button>Opportunities</button>
      </div>

      <div className="community-grid">
        <div>
          <div className="sort">
            Community posts <span>Latest⌄</span>
          </div>

          <Feed
            posts={posts.filter((post) =>
              post.communities?.includes(community.id)
            )}
          />
        </div>

        <aside className="info">
          <small>ABOUT</small>
          <h2>{community.name}</h2>
          <p>{community.desc}</p>

          <div>
            <Users size={16} /> {community.members} members
          </div>

          <div>
            <CheckCircle2 size={16} /> Verified CampusConnect community
          </div>
        </aside>
      </div>
    </section>
  );
}
