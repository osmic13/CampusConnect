import { useEffect, useState } from "react";
import Feed from "./Feed";

const API_URL = "http://localhost:5000/api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts`);

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();

        const formattedPosts = data.posts.map((post) => ({
          id: post.post_id,

          type:
            post.post_type === "NOTICE"
              ? "notice"
              : post.post_type === "OPPORTUNITY"
              ? "opportunity"
              : "club",

          author:
            post.post_type === "CLUB_ANNOUNCEMENT"
              ? "Coding Club"
              : "Graphic Era University",

          meta:
            post.post_type === "NOTICE"
              ? "Official Announcement"
              : post.post_type === "OPPORTUNITY"
              ? "Verified Opportunity"
              : "Verified Club",

          time: new Date(post.created_at).toLocaleDateString(),

          title: post.title,

          body: post.content,

          likes: 0,

          dislikes: 0,

          communities: []
        }));

        setPosts(formattedPosts);

      } catch (error) {
        console.error(error);
        setError("Unable to load posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Page
      title="Home"
      desc="Updates from your communities and interests."
    >
      {loading && (
        <p className="feed-status">
          Loading posts...
        </p>
      )}

      {error && (
        <p className="feed-status error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <Feed posts={posts} />
      )}
    </Page>
  );
}

export function Page({ title, desc, filters = [], children }) {
  return (
    <section className="page">
      <p className="eyebrow">CAMPUSCONNECT</p>

      <h1>{title}</h1>

      <p className="desc">{desc}</p>

      {filters.length > 0 && (
        <div className="filters">
          {filters.map((filter, index) => (
            <button
              className={index === 0 ? "active" : ""}
              key={filter}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {children}
    </section>
  );
}