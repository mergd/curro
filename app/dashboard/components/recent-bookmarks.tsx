"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

import { useQuery } from "convex/react";
import Link from "next/link";

export function RecentBookmarks() {
  const bookmarkedJobs = useQuery(api.bookmarks.listByUser);

  if (!bookmarkedJobs || bookmarkedJobs.length === 0) {
    return <p className="text-sm text-muted-foreground">No bookmarks yet</p>;
  }

  // Show only the 3 most recent bookmarks
  const recentBookmarks = bookmarkedJobs.slice(0, 3);

  return (
    <div className="space-y-3">
      {recentBookmarks.map((job) => (
        <div
          key={job._id}
          className="flex items-center justify-between p-3 bg-muted rounded-lg"
        >
          <div>
            <h4 className="font-medium">{job.title}</h4>
            <p className="text-sm text-muted-foreground">
              {job.company?.name || "Unknown Company"}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/jobs/${job._id}`}>View</Link>
          </Button>
        </div>
      ))}
      {bookmarkedJobs.length > 3 && (
        <div className="text-center pt-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard?tab=bookmarks">
              View all {bookmarkedJobs.length} bookmarks
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
