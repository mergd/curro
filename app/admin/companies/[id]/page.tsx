"use client";

import type { TabItem } from "@/components/ui/tabs";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyLogo } from "@/components/ui/company-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";

import { ArrowClockwiseIcon, TrashIcon } from "@phosphor-icons/react";
import {
  ActivityLogIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  GearIcon,
  InfoCircledIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { useAction, useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useMemo, useState } from "react";
import { toast } from "sonner";

import { CompanyDetailSkeleton } from "./components/company-detail-skeleton";
import { CompanyEditForm } from "./components/company-edit-form";
import { companyJobsColumns } from "./components/company-jobs-columns";
import { ErrorLogTable } from "./components/error-log-table";

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const [isClearingErrors, setIsClearingErrors] = useState(false);
  const [isResettingBackoff, setIsResettingBackoff] = useState(false);
  const isAdmin = useQuery(api.auth.isAdmin);

  const { id } = use(params);
  const company = useQuery(api.companies.get, { id: id as any });
  const jobs = useQuery(api.jobs.findActiveJobsByCompany, {
    companyId: id as any,
  });

  const forceScrape = useAction(api.scraper.scrape);
  const clearErrors = useMutation(api.companies.clearErrors);
  const resetBackoff = useMutation(api.companies.resetBackoff);

  if (isAdmin === undefined) {
    return <CompanyDetailSkeleton />;
  }

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleForceScrape = async () => {
    if (!company) return;

    setIsScrapingInProgress(true);
    try {
      const result = await forceScrape({
        companyId: company._id as any,
      });

      if (result.success) {
        toast.success(
          `Scraping initiated for ${company.name}. Jobs will be updated shortly.`,
        );
      } else if (result.error?.includes("skipped")) {
        toast.warning(`Scraping skipped for ${company.name}: ${result.error}`);
      } else {
        toast.error(
          `Failed to initiate scraping for ${company.name}: ${result.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error initiating scrape:", error);
      toast.error(
        `Failed to initiate scraping for ${company.name}. Please try again.`,
      );
    } finally {
      setIsScrapingInProgress(false);
    }
  };

  const handleClearErrors = async () => {
    if (!company) return;

    setIsClearingErrors(true);
    try {
      await clearErrors({ id: company._id });
      toast.success(`Cleared all errors for ${company.name}.`);
    } catch (error) {
      console.error("Error clearing errors:", error);
      toast.error("Failed to clear errors. Please try again.");
    } finally {
      setIsClearingErrors(false);
    }
  };

  const handleResetBackoff = async () => {
    if (!company) return;

    setIsResettingBackoff(true);
    try {
      await resetBackoff({ id: company._id });
      toast.success(
        `Reset backoff for ${company.name}. Scraping can now proceed normally.`,
      );
    } catch (error) {
      console.error("Error resetting backoff:", error);
      toast.error("Failed to reset backoff. Please try again.");
    } finally {
      setIsResettingBackoff(false);
    }
  };

  const tabItems: TabItem[] = useMemo(
    () => [
      {
        value: "overview",
        label: "Overview",
        icon: <InfoCircledIcon className="size-4" />,
      },
      {
        value: "jobs",
        label: "Jobs",
        icon: <GearIcon className="size-4" />,
        badge: jobs
          ? {
              count: jobs.length,
              variant: "default",
            }
          : {
              loading: true,
            },
      },
      {
        value: "errors",
        label: "Error Logs",
        icon: <ActivityLogIcon className="size-4" />,
        badge: company?.scrapingErrors
          ? {
              count: company.scrapingErrors.length,
              variant: company.scrapingErrors.length > 0 ? "red" : "default",
            }
          : {
              loading: true,
            },
      },
    ],
    [jobs, company?.scrapingErrors],
  );

  if (!company) {
    return <CompanyDetailSkeleton />;
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <CompanyEditForm
            company={company}
            onCancel={() => setIsEditing(false)}
            onSaved={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <ArrowLeftIcon className="size-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <CompanyLogo
                  logoUrl={company.logoUrl}
                  companyName={company.name}
                  size="md"
                />
                <div>
                  <h1 className="text-3xl font-bold">{company.name}</h1>
                  <p className="text-muted-foreground">
                    Company Management & Analytics
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link
                  href={company.jobBoardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon className="mr-2 size-4" />
                  Job Board
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <GearIcon className="mr-2 size-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Scraping Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={handleForceScrape}
                    disabled={isScrapingInProgress}
                  >
                    <ArrowClockwiseIcon
                      className={`size-4 mr-2 ${isScrapingInProgress ? "animate-spin" : ""}`}
                    />
                    {isScrapingInProgress ? "Scraping..." : "Force scrape jobs"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleClearErrors}
                    disabled={
                      isClearingErrors || !company.scrapingErrors?.length
                    }
                  >
                    <TrashIcon className="size-4 mr-2" />
                    {isClearingErrors ? "Clearing..." : "Clear errors"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleResetBackoff}
                    disabled={isResettingBackoff || !company.backoffInfo?.level}
                  >
                    <ArrowClockwiseIcon className="size-4 mr-2" />
                    {isResettingBackoff ? "Resetting..." : "Reset backoff"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={() => setIsEditing(true)}>
                <Pencil1Icon className="mr-2 size-4" />
                Edit Company
              </Button>
            </div>
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
                <EnhancedCompanyInfoCard company={company} />
              </div>
              <div className="space-y-6">
                <JobsStatsCard companyId={id as any} />
                <ErrorStatsCard company={company} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Scraped Jobs</h2>
                <p className="text-muted-foreground">
                  All jobs scraped from this company&apos;s job board
                </p>
              </div>
            </div>

            <Suspense fallback={<DataTableSkeleton columnCount={6} />}>
              <CompanyJobsTable companyId={id as any} />
            </Suspense>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Error Logs</h2>
              <p className="text-muted-foreground">
                Recent scraping errors and issues (last 24 hours)
              </p>
            </div>

            <ErrorLogTable company={company} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EnhancedCompanyInfoCard({ company }: { company: any }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const description = company.description || "";
  const shouldTruncate = description.length > 200;
  const displayDescription =
    shouldTruncate && !showFullDescription
      ? description.slice(0, 400) + "..."
      : description;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Company Information</h3>
        </div>

        {/* Description */}
        {description && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Description
            </div>
            <div className="text-sm leading-relaxed">
              {displayDescription}
              {shouldTruncate && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="ml-2 text-primary hover:underline text-xs font-medium"
                >
                  {showFullDescription ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {company.website && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Website
                </div>
                <Link
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline text-primary flex items-center gap-1"
                >
                  {company.website.replace(/^https?:\/\//, "")}
                  <ExternalLinkIcon className="size-3" />
                </Link>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                ATS Type
              </div>
              <Badge className="text-xs">
                {company.sourceType.charAt(0).toUpperCase() +
                  company.sourceType.slice(1)}
              </Badge>
            </div>

            {company.foundedYear && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Founded
                </div>
                <div className="text-sm">{company.foundedYear}</div>
              </div>
            )}

            {company.lastScraped && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Last Scraped
                </div>
                <div className="text-sm">
                  {formatDistanceToNow(company.lastScraped, {
                    addSuffix: true,
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {company.stage && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Stage
                </div>
                <Badge className="text-xs">
                  {company.stage
                    .replace("-", " ")
                    .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Badge>
              </div>
            )}

            {company.numberOfEmployees && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Company Size
                </div>
                <div className="text-sm">{company.numberOfEmployees}</div>
              </div>
            )}

            {company.recentFinancing && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Recent Financing
                </div>
                <div className="text-sm">
                  ${company.recentFinancing.amount.toLocaleString()} (
                  {company.recentFinancing.date})
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories and Tags */}
        {(company.category || company.subcategory || company.tags) && (
          <div className="space-y-4">
            {company.category && company.category.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Categories
                </div>
                <div className="flex flex-wrap gap-2">
                  {company.category.map((cat: string, i: number) => (
                    <Badge key={i} className="text-xs">
                      {cat.charAt(0).toUpperCase() +
                        cat.slice(1).replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {company.subcategory && company.subcategory.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Subcategories
                </div>
                <div className="flex flex-wrap gap-2">
                  {company.subcategory.map((subcat: string, i: number) => (
                    <Badge key={i} className="text-xs">
                      {subcat.charAt(0).toUpperCase() +
                        subcat.slice(1).replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {company.tags && company.tags.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {company.tags.map((tag: string, i: number) => (
                    <Badge key={i} className="text-xs">
                      {tag.charAt(0).toUpperCase() +
                        tag.slice(1).replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Locations and Investors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {company.locations && company.locations.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Locations
              </div>
              <div className="space-y-1">
                {company.locations.map((location: string, i: number) => (
                  <div key={i} className="text-sm">
                    {location}
                  </div>
                ))}
              </div>
            </div>
          )}

          {company.investors && company.investors.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Investors
              </div>
              <div className="space-y-1">
                {company.investors.map((investor: string, i: number) => (
                  <div key={i} className="text-sm">
                    {investor}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function JobsStatsCard({ companyId }: { companyId: string }) {
  const jobs = useQuery(api.jobs.findActiveJobsByCompany, {
    companyId: companyId as any,
  });

  const totalJobs = jobs?.length || 0;
  const recentJobs =
    jobs?.filter(
      (job) =>
        job.lastScraped &&
        job.lastScraped > Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).length || 0;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Job Statistics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Jobs</span>
            <span className="text-2xl font-bold">{totalJobs}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Active (7 days)
            </span>
            <span className="text-lg font-semibold text-green-600">
              {recentJobs}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span className="text-sm font-medium">
              {totalJobs > 0 ? Math.round((recentJobs / totalJobs) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ErrorStatsCard({ company }: { company: any }) {
  const errors = company.scrapingErrors || [];
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  const recentErrors = errors.filter(
    (error: any) => error.timestamp > twentyFourHoursAgo,
  );
  const isProblematic = recentErrors.length >= 10;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Error Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Errors (24h)</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-bold ${isProblematic ? "text-red-600" : recentErrors.length > 0 ? "text-orange-600" : "text-green-600"}`}
              >
                {recentErrors.length}
              </span>
              {isProblematic && (
                <ExclamationTriangleIcon className="size-5 text-red-600" />
              )}
            </div>
          </div>
          <div className="text-xs">
            {isProblematic ? (
              <span className="text-red-600 font-medium">
                Company marked as problematic
              </span>
            ) : recentErrors.length > 0 ? (
              <span className="text-orange-600">Minor issues detected</span>
            ) : (
              <span className="text-green-600">Operating normally</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CompanyJobsTable({ companyId }: { companyId: string }) {
  const router = useRouter();
  const jobs = useQuery(api.jobs.findActiveJobsByCompany, {
    companyId: companyId as any,
  });

  const { table } = useDataTable({
    data: jobs || [],
    columns: companyJobsColumns,
    pageCount: Math.ceil((jobs?.length || 0) / 10),
    initialState: {
      sorting: [{ id: "title", desc: false }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const handleRowClick = (row: any) => {
    const job = row.original;
    router.push(`/admin/jobs/${job._id}`);
  };

  if (!jobs) {
    return <DataTableSkeleton columnCount={6} />;
  }

  return (
    <DataTable table={table} onRowClick={handleRowClick}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
