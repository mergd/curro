import type { Post } from "@/types";

import { TableOfContents } from "@/components/on-this-page";
import { PostNavigation } from "@/components/post-navigation";
import { ShareDropdown } from "@/components/share-dropdown";
import Link from "@/components/ui/link";
import { formatter } from "@/lib/formatter";
import { getPosts } from "@/lib/mdx";
import { MDX } from "@/mdx-components";

import React from "react";
import { readingTime } from "reading-time-estimator";

interface Props {
  post: Post;
  route: string;
}

export const Layout = ({ post, route }: Props) => {
  const posts = getPosts(route);

  const Separator = () => {
    return <div>⋅</div>;
  };

  const PublishedTime = () => {
    return <div>Published {formatter.date(new Date(post.time.created))}</div>;
  };
  const UpdateTime = () => {
    return <div>Updated {formatter.date(new Date(post.time.updated))}</div>;
  };

  const Tags = () => {
    if (!post.tags) return null;
    return (
      <div key={post.tags.join("-")}>
        Tags:{" "}
        {post.tags.map((tag, index) => (
          <span key={`${tag}-${index}`}>
            <Link underline href={`/tags/${tag}`}>
              {tag}
            </Link>

            {index !== (post.tags?.length ?? 0) - 1 && ", "}
          </span>
        ))}
      </div>
    );
  };

  const ReadingTime = () => {
    return (
      <div>
        {readingTime(post.content).minutes}{" "}
        {readingTime(post.content).minutes === 1 ? "minute" : "minutes"} read
      </div>
    );
  };

  const isPost = route.includes("/blog");
  return (
    <React.Fragment>
      <div className="flex flex-col">
        <div>
          <h1>{post.title}</h1>
        </div>
        <div className="flex gap-2 text-muted text-small">
          <Tags />
        </div>
        <div className="mt-1 flex gap-2 text-muted text-small">
          <PublishedTime />
          <Separator />
          <UpdateTime />
          {isPost && <Separator />}
          {isPost && <ReadingTime />}

          <div className="flex-grow" />
          {isPost && <ShareDropdown title={post.title} />}
        </div>
      </div>

      <MDX source={post.content} />
      <PostNavigation posts={posts} />
      <TableOfContents />
    </React.Fragment>
  );
};
