"use client";

import { api } from "@/convex/_generated/api";

import { useQuery } from "convex/react";

import { JobPreviewCard } from "./job-preview-card";
import { JobPreviewSkeleton } from "./job-preview-skeleton";

export function RecentJobs() {
  const result = useQuery(api.jobs.listPaginated, {
    limit: 6,
    sortBy: "_creationTime",
    sortOrder: "desc",
  });

  if (!result) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobPreviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  const { jobs: recentJobs } = result;

  if (recentJobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No jobs available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recentJobs.map((job) => (
        <JobPreviewCard key={job._id} job={job} />
      ))}
    </div>
  );
}
