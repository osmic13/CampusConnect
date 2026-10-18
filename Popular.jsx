import { posts } from "./data";
import Feed from "./Feed";
import { Page } from "./Home";

export default function Popular() {
  const sortedPosts = [...posts].sort(
    (a, b) => b.likes + b.dislikes - a.likes - a.dislikes
  );

  return (
    <>
      <Page
        title="Popular"
        desc="The most interacted-with content across CampusConnect."
        filters={["Popular", "This Week", "This Month"]}
      />
      <Feed posts={sortedPosts} />
    </>
  );
}
