import type { Doc } from "@/convex/_generated/dataModel";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CompanyLogo } from "@/components/ui/company-logo";
import { CompanyPreviewPopover } from "@/components/ui/company-preview-popover";

import { ClockIcon, GlobeIcon } from "@radix-ui/react-icons";
import Link from "next/link";

type JobWithCompany = Doc<"jobs"> & {
  company: Doc<"companies"> | null;
};

interface JobPreviewCardProps {
  job: JobWithCompany;
}

export function JobPreviewCard({ job }: JobPreviewCardProps) {
  const formatSalary = (compensation: JobWithCompany["compensation"]) => {
    if (!compensation) return null;

    const { min, max, currency = "USD", type } = compensation;
    const symbol = currency === "USD" ? "$" : currency;

    if (min && max) {
      return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()} ${type === "annual" ? "/year" : "/hr"}`;
    } else if (min) {
      return `${symbol}${min.toLocaleString()}+ ${type === "annual" ? "/year" : "/hr"}`;
    }
    return null;
  };

  const timeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <Link href={`/jobs/${job._id}`} className="block">
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border border-border">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2">
                {job.title}
              </h3>
              {job.company ? (
                <CompanyPreviewPopover
                  companyId={job.company._id}
                  side="top"
                  align="start"
                >
                  <button
                    className="text-muted-foreground font-medium hover:text-foreground transition-colors text-left"
                    onClick={(e) => e.preventDefault()}
                  >
                    {job.company.name}
                  </button>
                </CompanyPreviewPopover>
              ) : (
                <p className="text-muted-foreground font-medium">
                  Unknown Company
                </p>
              )}
            </div>
            {job.company && (
              <CompanyPreviewPopover
                companyId={job.company._id}
                side="top"
                align="end"
              >
                <div onClick={(e) => e.preventDefault()}>
                  <CompanyLogo
                    logoUrl={job.company?.logoUrl}
                    companyName={job.company?.name || "Unknown Company"}
                    size="md"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>
              </CompanyPreviewPopover>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2">
            {job.locations && job.locations.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GlobeIcon className="size-4" />
                <span>{job.locations.slice(0, 2).join(", ")}</span>
                {job.locations.length > 2 && (
                  <span>+{job.locations.length - 2} more</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClockIcon className="size-4" />
              <span>{timeAgo(job._creationTime)}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {job.roleType && (
              <Badge color="blue" className="text-xs">
                {job.roleType
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            )}
            {job.remoteOptions && (
              <Badge color="green" className="text-xs">
                {job.remoteOptions === "on-site"
                  ? "On-site"
                  : job.remoteOptions === "remote"
                    ? "Remote"
                    : "Hybrid"}
              </Badge>
            )}
            {job.employmentType === "internship" && (
              <Badge color="purple" className="text-xs">
                Internship
              </Badge>
            )}
          </div>

          {/* Salary */}
          {formatSalary(job.compensation) && (
            <div className="text-sm font-medium text-green-600">
              {formatSalary(job.compensation)}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
