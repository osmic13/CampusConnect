import PostCard from "./PostCard";

export default function Feed({ posts }) {
  return (
    <div className="feed">
      {posts.map((post) => (
        <PostCard key={post.id} p={post} />
      ))}
    </div>
  );
}
