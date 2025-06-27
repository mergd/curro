import * as FadeIn from "@/components/motion/staggers/fade";
import { Posts } from "@/components/posts";
import { POSTS_DIRECTORY } from "@/lib/constants";
import { getPosts } from "@/lib/mdx";
import { OpenGraph } from "@/lib/og";

import { Heading } from "@radix-ui/themes";
import React from "react";

export function generateMetadata() {
  const title = POSTS_DIRECTORY;
  const image = `${process.env.NEXT_PUBLIC_SITE_URL}api/og?title=${encodeURIComponent(title)}`;

  return {
    ...OpenGraph,
    title,
    openGraph: {
      title,
      images: [image],
    },
    twitter: {
      images: [image],
    },
  };
}

export default function Page() {
  const posts = getPosts();

  return (
    <React.Fragment>
      <FadeIn.Item>
        <Heading className="font-display">Blog</Heading>
        <p className="text-muted">A collection of my thoughts and ideas.</p>
        <Posts category={POSTS_DIRECTORY} posts={posts} />
      </FadeIn.Item>
    </React.Fragment>
  );
}
