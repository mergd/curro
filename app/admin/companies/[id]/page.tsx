"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";

import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { Card } from "@radix-ui/themes";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Suspense, use, useState } from "react";

import { CompanyDetailSkeleton } from "./components/company-detail-skeleton";
import { CompanyEditForm } from "./components/company-edit-form";
import { companyJobsColumns } from "./components/company-jobs-columns";
import { ErrorLogTable } from "./components/error-log-table";

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { id } = use(params);
  const company = useQuery(api.companies.get, { id: id as any });

  if (!company) {
    return <CompanyDetailSkeleton />;
  }

  if (isEditing) {
    return (
      <div className="space-y-6 p-6">
        <CompanyEditForm
          company={company}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="cursor-pointer">
            <Link href="/admin">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">
              Company Details & Management
            </p>
          </div>
        </div>
        <Button onClick={() => setIsEditing(true)} className="cursor-pointer">
          <Pencil1Icon className="mr-2 size-4" />
          Edit Company
        </Button>
      </div>

      {/* Company Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompanyInfoCard company={company} />
        <JobsStatsCard companyId={id as any} />
        <ErrorStatsCard company={company} />
      </div>

      {/* Jobs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Scraped Jobs</h2>
            <p className="text-muted-foreground">
              All jobs scraped from this company&apos;s job board
            </p>
          </div>
          <Button asChild variant="outline" className="cursor-pointer">
            <Link
              href={company.jobBoardUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon className="mr-2 size-4" />
              View Job Board
            </Link>
          </Button>
        </div>

        <Suspense fallback={<DataTableSkeleton columnCount={6} />}>
          <CompanyJobsTable companyId={id as any} />
        </Suspense>
      </div>

      {/* Error Logs Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Error Logs</h2>
          <p className="text-muted-foreground">
            Recent scraping errors and issues (last 24 hours)
          </p>
        </div>

        <ErrorLogTable company={company} />
      </div>
    </div>
  );
}

function CompanyInfoCard({ company }: { company: any }) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Company Information</h3>
        </div>

        <div className="space-y-3">
          {company.website && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Website
              </div>
              <Link
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                {company.website}
              </Link>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-muted-foreground">
              ATS Type
            </div>
            <Badge color="blue" className="text-xs">
              {company.sourceType.charAt(0).toUpperCase() +
                company.sourceType.slice(1)}
            </Badge>
          </div>

          {company.stage && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Stage
              </div>
              <Badge color="purple" className="text-xs">
                {company.stage
                  .replace("-", " ")
                  .replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </Badge>
            </div>
          )}

          {company.numberOfEmployees && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Employees
              </div>
              <div className="text-sm">{company.numberOfEmployees}</div>
            </div>
          )}

          {company.locations && company.locations.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Locations
              </div>
              <div className="text-sm">{company.locations.join(", ")}</div>
            </div>
          )}

          {company.tags && company.tags.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Tags
              </div>
              <div className="flex flex-wrap gap-1">
                {company.tags.map((tag: string, i: number) => (
                  <Badge key={i} color="gray" className="text-xs">
                    {tag}
                  </Badge>
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

  return (
    <Card className="p-6">
      <div className="space-y-2">
        <div className="text-2xl font-bold">{jobs?.length || 0}</div>
        <div className="text-sm text-muted-foreground">Active Jobs</div>
        <div className="text-xs text-muted-foreground">
          Currently scraped positions
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
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className={`text-2xl font-bold ${isProblematic ? "text-red-600" : recentErrors.length > 0 ? "text-orange-600" : "text-green-600"}`}
          >
            {recentErrors.length}
          </div>
          {isProblematic && (
            <ExclamationTriangleIcon className="size-5 text-red-600" />
          )}
        </div>
        <div className="text-sm text-muted-foreground">Errors (24h)</div>
        {isProblematic && (
          <div className="text-xs text-red-600">
            Company marked as problematic
          </div>
        )}
      </div>
    </Card>
  );
}

function CompanyJobsTable({ companyId }: { companyId: string }) {
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

  if (!jobs) {
    return <DataTableSkeleton columnCount={6} />;
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
