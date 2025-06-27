"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function JobList() {
  const jobs = useQuery(api.jobs.list);

  return (
    <div className="space-y-4">
      {jobs?.map((job) => (
        <div key={job._id} className="border p-4 rounded-lg">
          <h4 className="font-semibold text-lg">{job.title}</h4>
          <p className="text-gray-600">{job.company?.name} - {job.location}</p>
          <p className="mt-2 text-sm">Source: {job.source}</p>
          {/* Add a link to the job details page */}
        </div>
      ))}
    </div>
  );
}
