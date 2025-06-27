import type { Locale } from "@/lib/i18n/routing";

import { Posts } from "@/components/posts";
import { getPostsByTag } from "@/lib/mdx";

interface Props {
  params: Promise<{
    locale: Locale;
    tag: string;
  }>;
}

export default async function TagPage(props: Props) {
  const params = await props.params;
  const posts = getPostsByTag(params.locale, params.tag);

  if (!posts.length) {
    return (
      <div>
        No posts found tagged with
        <span className="font-semibold">{params.tag}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <h1 className="">Posts tagged with &quot;{params.tag}&quot;</h1>

        <p className="text-muted text-sm ">
          Found {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      <Posts posts={posts} showNumber={false} />
    </div>
  );
}
