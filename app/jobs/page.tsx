import { JobList } from "@/components/jobs/job-list";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Job Listings</h3>
        <p className="text-sm text-muted-foreground">
          Browse the latest job openings.
        </p>
      </div>
      <JobList />
    </div>
  );
}
