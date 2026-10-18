import { posts } from "./data";
import Feed from "./Feed";
import { Page } from "./Home";

export default function Explore() {
  return (
    <>
      <Page
        title="Explore"
        desc="Discover opportunities, club updates, events and new campus listings."
        filters={["All", "Opportunities", "Clubs", "Events"]}
      />
      <Feed posts={posts} />
    </>
  );
}
