"use client";

import type { TabItem } from "@/components/ui/tabs";
import type { Id } from "@/convex/_generated/dataModel";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";
import { formatSalary, timeAgo } from "@/lib/formatters";

import {
  ArrowLeftIcon,
  CalendarIcon,
  ExternalLinkIcon,
  GlobeIcon,
  InfoCircledIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useMemo } from "react";

interface CompanyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { id } = use(params);
  const company = useQuery(api.companies.get, { id: id as Id<"companies"> });
  const jobs = useQuery(api.jobs.listByCompany, {
    companyId: id as Id<"companies">,
  });
  const user = useQuery(api.auth.currentUser);
  const userProfile = useQuery(api.userProfiles.get);

  const relevantJobs = useMemo(() => {
    if (!jobs || !userProfile) return jobs;

    const userInterests = userProfile.interests || [];
    const userExperience = userProfile.yearsOfExperience || 0;

    // Score jobs based on relevance to user profile
    const scoredJobs = jobs.map((job) => {
      let score = 0;

      // Interest matching - check if job role type matches user interests
      if (
        job.roleType &&
        userInterests.some(
          (interest) =>
            interest
              .toLowerCase()
              .includes(job.roleType!.replace("-", " ").toLowerCase()) ||
            job
              .roleType!.replace("-", " ")
              .toLowerCase()
              .includes(interest.toLowerCase()),
        )
      ) {
        score += 3;
      }

      // Experience level matching
      if (job.yearsOfExperience) {
        const jobMinExp = job.yearsOfExperience.min;
        const jobMaxExp = job.yearsOfExperience.max || jobMinExp + 5;

        if (userExperience >= jobMinExp && userExperience <= jobMaxExp) {
          score += 2; // Perfect match
        } else if (
          userExperience >= jobMinExp - 1 &&
          userExperience <= jobMaxExp + 1
        ) {
          score += 1; // Close match
        }
      }

      // Boost newer jobs slightly
      const daysOld = (Date.now() - job._creationTime) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) score += 0.5;

      return { ...job, relevanceScore: score };
    });

    // Sort by relevance score (descending), then by creation time (newest first)
    return scoredJobs.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b._creationTime - a._creationTime;
    });
  }, [jobs, userProfile]);

  const jobsToDisplay = user ? relevantJobs : jobs;

  const tabItems: TabItem[] = useMemo(
    () => [
      {
        value: "overview",
        label: "Overview",
        icon: <InfoCircledIcon className="size-4" />,
      },
      {
        value: "jobs",
        label: "Job Openings",
        icon: <PersonIcon className="size-4" />,
        badge: jobs
          ? {
              count: jobs.length,
              variant: "default",
            }
          : {
              loading: true,
            },
      },
    ],
    [jobs],
  );

  if (!company) {
    return <CompanyDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/companies">
                  <ArrowLeftIcon className="size-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <CompanyLogo
                  logoUrl={company.logoUrl}
                  companyName={company.name}
                  size="lg"
                />
                <div>
                  <h1 className="text-xl font-semibold">{company.name}</h1>
                </div>
              </div>
            </div>
            {company.website && (
              <Button asChild variant="outline">
                <Link
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon className="mr-2 size-4" />
                  Visit Website
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList items={tabItems} />

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CompanyInfoCard company={company} />
              </div>
              <div className="space-y-6">
                <CompanyStatsCard
                  company={company}
                  jobCount={jobs?.length || 0}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Job Openings</h2>
                <p className="text-muted-foreground">
                  {user && userProfile
                    ? "Jobs are sorted by relevance to your profile"
                    : `Open positions at ${company.name}`}
                </p>
              </div>
            </div>

            <Suspense fallback={<DataTableSkeleton columnCount={6} />}>
              <CompanyJobsTable jobs={jobsToDisplay || []} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CompanyDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/companies">
                  <ArrowLeftIcon className="size-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <Skeleton className="size-16 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-80" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="p-6 space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-16" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyInfoCard({ company }: { company: any }) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">About {company.name}</h2>
          {company.description && (
            <p className="text-muted-foreground leading-relaxed mb-4">
              {company.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {company.foundedYear && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <span className="text-sm">Founded {company.foundedYear}</span>
            </div>
          )}

          {company.numberOfEmployees && (
            <div className="flex items-center gap-2">
              <PersonIcon className="size-4 text-muted-foreground" />
              <span className="text-sm">
                {company.numberOfEmployees} employees
              </span>
            </div>
          )}

          {company.locations && company.locations.length > 0 && (
            <div className="flex items-center gap-2 col-span-2">
              <GlobeIcon className="size-4 text-muted-foreground" />
              <span className="text-sm">{company.locations.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Company Tags */}
        {(company.category || company.stage || company.tags) && (
          <div className="space-y-3">
            <h3 className="font-medium">Company Details</h3>
            <div className="flex flex-wrap gap-2">
              {company.stage && <Badge color="blue">{company.stage}</Badge>}
              {company.category?.map((cat: string) => (
                <Badge key={cat} color="green">
                  {cat}
                </Badge>
              ))}
              {company.tags?.map((tag: string) => (
                <Badge key={tag} color="gray">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Financing */}
        {company.recentFinancing && (
          <div className="space-y-2">
            <h3 className="font-medium">Recent Financing</h3>
            <p className="text-sm text-muted-foreground">
              ${company.recentFinancing.amount?.toLocaleString()} raised{" "}
              {company.recentFinancing.date &&
                `in ${company.recentFinancing.date}`}
            </p>
          </div>
        )}

        {/* Investors */}
        {company.investors && company.investors.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Investors</h3>
            <div className="flex flex-wrap gap-2">
              {company.investors.map((investor: string) => (
                <Badge key={investor} color="purple">
                  {investor}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function CompanyStatsCard({
  company,
  jobCount,
}: {
  company: any;
  jobCount: number;
}) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Open Positions
            </span>
            <span className="font-semibold">{jobCount}</span>
          </div>

          {company.lastScraped && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Last Updated
              </span>
              <span className="text-sm">{timeAgo(company.lastScraped)}</span>
            </div>
          )}

          {company.sourceType && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                ATS Platform
              </span>
              <Badge color="gray" className="text-xs">
                {company.sourceType.charAt(0).toUpperCase() +
                  company.sourceType.slice(1)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function CompanyJobsTable({ jobs }: { jobs: any[] }) {
  const router = useRouter();

  const jobsColumns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Position",
        cell: ({ row }: any) => {
          const job = row.original;
          return (
            <div className="space-y-1">
              <div className="font-medium">{job.title}</div>
              {job.locations && job.locations.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {job.locations.slice(0, 2).join(", ")}
                  {job.locations.length > 2 && ` +${job.locations.length - 2}`}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "roleType",
        header: "Type",
        cell: ({ row }: any) => {
          const roleType = row.getValue("roleType");
          if (!roleType) return null;
          return (
            <Badge color="blue" className="text-xs">
              {roleType
                .replace("-", " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </Badge>
          );
        },
      },
      {
        accessorKey: "remoteOptions",
        header: "Remote",
        cell: ({ row }: any) => {
          const remoteOptions = row.getValue("remoteOptions");
          if (!remoteOptions) return null;
          return (
            <Badge color="green" className="text-xs">
              {remoteOptions === "on-site"
                ? "On-site"
                : remoteOptions === "remote"
                  ? "Remote"
                  : "Hybrid"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "compensation",
        header: "Salary",
        cell: ({ row }: any) => {
          const compensation = row.getValue("compensation");
          const salary = formatSalary(compensation);
          return salary ? (
            <span className="text-sm font-medium text-green-600">{salary}</span>
          ) : null;
        },
      },
      {
        accessorKey: "_creationTime",
        header: "Posted",
        cell: ({ row }: any) => {
          const timestamp = row.getValue("_creationTime");
          return <span className="text-sm">{timeAgo(timestamp)}</span>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => {
          const job = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/jobs/${job._id}`}>View</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href={job.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="size-4" />
                </Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data: jobs,
    columns: jobsColumns,
    pageCount: Math.ceil(jobs.length / 10),
    initialState: {
      sorting: [{ id: "_creationTime", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  if (jobs.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <PersonIcon className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Open Positions</h3>
          <p className="text-muted-foreground">
            This company doesn&apos;t have any job openings at the moment.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <DataTable
      table={table}
      onRowClick={(row) => router.push(`/jobs/${row.original._id}`)}
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
