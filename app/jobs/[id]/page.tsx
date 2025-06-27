import { JobDetails } from "@/components/jobs/job-details";

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <JobDetails id={params.id} />
    </div>
  );
}
