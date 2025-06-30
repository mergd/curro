"use client";

import type { TabItem } from "@/components/ui/tabs";
import type { Id } from "@/convex/_generated/dataModel";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { formatSalary, timeAgo } from "@/lib/formatters";

import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";
import { useQuery } from "convex/react";
import Link from "next/link";
import { use, useMemo } from "react";

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const job = useQuery(api.jobs.get, { id: id as Id<"jobs"> });

  const hasEmbeddableATS = useMemo(() => {
    if (!job?.company?.sourceType) return false;
    return (
      job.company.sourceType === "greenhouse" ||
      job.company.sourceType === "ashby"
    );
  }, [job?.company?.sourceType]);

  const tabItems: TabItem[] = useMemo(() => {
    const items: TabItem[] = [
      {
        value: "overview",
        label: "Overview",
        icon: <FileTextIcon className="size-4" />,
      },
    ];

    if (hasEmbeddableATS && job?.company?.sourceType) {
      const atsName =
        job.company.sourceType === "greenhouse" ? "Greenhouse" : "Ashby";
      items.push({
        value: "apply",
        label: `Apply via ${atsName}`,
        icon: <CheckIcon className="size-4" />,
      });
    }

    return items;
  }, [hasEmbeddableATS, job?.company?.sourceType]);

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
          <Button asChild variant="ghost" size="sm" className="">
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
              {job.company?.sourceType &&
                job.company.sourceType !== "other" && (
                  <Badge color="gray">
                    {job.company.sourceType.charAt(0).toUpperCase() +
                      job.company.sourceType.slice(1)}{" "}
                    ATS
                  </Badge>
                )}
            </div>

            {/* Salary */}
            {formatSalary(job.compensation) && (
              <div className="text-lg font-semibold text-green-600">
                {formatSalary(job.compensation)}
              </div>
            )}

            {/* Tabs for Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList items={tabItems} />

              <TabsContent value="overview" className="space-y-6">
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
                  <Button asChild size="lg" className="">
                    <Link
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apply Now
                      <ExternalLinkIcon className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              {hasEmbeddableATS && job.company?.sourceType && (
                <TabsContent value="apply" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">
                          Apply Directly
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Complete your application in the{" "}
                          {job.company.sourceType === "greenhouse"
                            ? "Greenhouse"
                            : "Ashby"}{" "}
                          interface below
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open in New Tab
                          <ExternalLinkIcon className="ml-2 size-4" />
                        </Link>
                      </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden bg-background">
                      <iframe
                        src={job.url}
                        className="w-full h-[800px] border-0"
                        title={`Apply for ${job.title} at ${job.company?.name}`}
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                      />
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
}
