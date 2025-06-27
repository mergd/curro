"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { useQuery } from "convex/react";

export function JobDetails({ id }: { id: Id<"jobs"> }) {
  const job = useQuery(api.jobs.get, { id });

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold">{job.title}</h3>
      <p className="text-lg text-gray-700">
        {job.company?.name} - {job.locations?.[0]}
      </p>
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        Apply here
      </a>

      <div className="mt-8">
        <h4 className="font-semibold text-xl">Job Description</h4>
        <div dangerouslySetInnerHTML={{ __html: job.description }} />
      </div>

      {job.parsedRequirements && (
        <div className="mt-8">
          <h4 className="font-semibold text-xl">Parsed Requirements</h4>
          <p>{job.parsedRequirements}</p>
        </div>
      )}

      {job.company && (
        <div className="mt-8 p-4 border rounded-lg">
          <h4 className="font-semibold text-xl">About {job.company.name}</h4>
          <p>
            <strong>Stage:</strong> {job.company.stage}
          </p>
          <p>
            <strong>Employees:</strong> {job.company.numberOfEmployees}
          </p>
          {job.company.recentFinancing && (
            <p>
              <strong>Recent Financing:</strong>{" "}
              {job.company.recentFinancing.amount} on{" "}
              {job.company.recentFinancing.date}
            </p>
          )}
          {job.company.investors && (
            <p>
              <strong>Investors:</strong> {job.company.investors.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
