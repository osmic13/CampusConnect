import { posts } from "./data";
import Feed from "./Feed";
import { Page } from "./Home";

export default function Notices() {
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
      <Feed posts={posts.filter((post) => post.type === "notice")} />
    </>
  );
}
