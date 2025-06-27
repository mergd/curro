import type { Post } from "@/types/post";

import { formatter } from "@/lib/formatter";
import { cn } from "@/lib/utils";

import { ImageIcon } from "lucide-react";
import { Link as NextViewTransition } from "next-view-transitions";
import Image from "next/image";
import React from "react";

interface PostProps {
  category?: string;
  variant?: "compact" | "default" | "thumbnail";
  limit?: number;
  posts?: Post[];
  showNumber?: boolean;
}

const PostTitle = ({ post }: { post: Post }) => (
  <p className="font-medium">{post.title}</p>
);

const PostMeta = ({ post }: { post: Post }) => (
  <div className="text-muted text-sm">
    {formatter.date(new Date(post.time.created))}
  </div>
);

const PostSummary = ({ post }: { post: Post }) =>
  post.summary && (
    <p className="line-clamp-2 text-gray-11 text-sm">{post.summary}</p>
  );

const PostImage = ({ post }: { post: Post }) => (
  <div className="relative aspect-[1.91/1] h-8 overflow-hidden rounded-md">
    {post.media?.header ? (
      <Image
        src={post.media.header.src}
        alt={post.media.header.alt || post.title}
        fill
        className="object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
    ) : (
      <div className="flex h-full items-center justify-center bg-gray-3">
        <ImageIcon className="size-4 text-gray-8" />
      </div>
    )}
  </div>
);

export const Posts = ({
  category,
  variant = "thumbnail",
  limit,
  posts,
  showNumber = true,
}: PostProps) => {
  const sortedPosts = posts
    ?.sort((a, b) => {
      return (
        new Date(b.time.created).getTime() - new Date(a.time.created).getTime()
      );
    })
    .slice(0, limit);

  const Separator = () => <div className="border-border border-t" />;

  if (!sortedPosts || sortedPosts?.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col">
      <NextViewTransition
        href={`/${category}`}
        className="flex justify-between"
      >
        <h2 className="py-2 text-muted capitalize">
          {category}{" "}
          {showNumber && sortedPosts.length > 0 && `(${sortedPosts.length})`}
        </h2>
      </NextViewTransition>

      {sortedPosts.map((post, index) => {
        const PostContent = () => {
          switch (variant) {
            case "compact":
              return (
                <div
                  key={post.slug}
                  className="flex w-full items-center justify-between py-2"
                >
                  <PostTitle post={post} />
                  <PostMeta post={post} />
                </div>
              );

            case "thumbnail":
              return (
                <div key={post.slug} className="flex items-center gap-2 py-2">
                  <div className="space-y-1">
                    <PostTitle post={post} />
                    <PostSummary post={post} />
                  </div>
                  <div className="flex-grow" />
                  <PostMeta post={post} />
                </div>
              );

            default:
              return (
                <div key={post.slug} className="flex gap-4 py-2">
                  <PostImage post={post} />
                  <div className="flex flex-1 items-center justify-between">
                    <div className="space-y-1">
                      <PostTitle post={post} />
                      <PostSummary post={post} />
                    </div>
                    <PostMeta post={post} />
                  </div>
                </div>
              );
          }
        };

        return (
          <React.Fragment key={post.slug}>
            <Separator />
            <NextViewTransition
              href={`/${category}/${post.slug}`}
              className={cn(
                "group -mx-2 rounded-md px-2 transition-colors",
                variant !== "compact" && "hover:bg-gray-a1",
              )}
            >
              <PostContent />
            </NextViewTransition>
          </React.Fragment>
        );
      })}
    </div>
  );
};
