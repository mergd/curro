"use client";

import type { Id } from "@/convex/_generated/dataModel";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { formatSalary, timeAgo } from "@/lib/formatters";

import {
  ArrowLeftIcon,
  ClockIcon,
  ExternalLinkIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";
import { Card } from "@radix-ui/themes";
import { useQuery } from "convex/react";
import Link from "next/link";

import { api } from "../../../convex/_generated/api";

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = useQuery(api.jobs.get, { id: id as Id<"jobs"> });

  if (!job) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="cursor-pointer">
            <Link href="/jobs">
              <ArrowLeftIcon className="size-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* Job Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-muted-foreground">
                    {job.company?.name || "Unknown Company"}
                  </span>
                  {job.company?.website && (
                    <Link
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {job.company.website}
                    </Link>
                  )}
                </div>
              </div>
              <CompanyLogo
                logoUrl={job.company?.logoUrl}
                companyName={job.company?.name || "Unknown Company"}
                size="lg"
              />
            </div>

            {/* Job Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {job.locations && job.locations.length > 0 && (
                <div className="flex items-center gap-2">
                  <GlobeIcon className="size-4" />
                  <span>{job.locations.join(", ")}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ClockIcon className="size-4" />
                <span>Posted {timeAgo(job._creationTime)}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {job.roleType && (
                <Badge color="blue">
                  {job.roleType
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              )}
              {job.remoteOptions && (
                <Badge color="green">
                  {job.remoteOptions === "on-site"
                    ? "On-site"
                    : job.remoteOptions === "remote"
                      ? "Remote"
                      : "Hybrid"}
                </Badge>
              )}
              {job.employmentType === "internship" && (
                <Badge color="purple">Internship</Badge>
              )}
              {job.yearsOfExperience && (
                <Badge color="yellow">
                  {job.yearsOfExperience.min}
                  {job.yearsOfExperience.max
                    ? `-${job.yearsOfExperience.max}`
                    : "+"}
                  {" years experience"}
                </Badge>
              )}
            </div>

            {/* Salary */}
            {formatSalary(job.compensation) && (
              <div className="text-lg font-semibold text-green-600">
                {formatSalary(job.compensation)}
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Job Description</h2>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Requirements */}
            {job.parsedRequirements && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Requirements</h2>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {job.parsedRequirements}
                  </div>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="pt-6">
              <Button asChild size="lg" className="cursor-pointer">
                <Link href={job.url} target="_blank" rel="noopener noreferrer">
                  Apply Now
                  <ExternalLinkIcon className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
