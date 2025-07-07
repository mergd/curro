"use client";

import type { TabItem } from "@/components/ui/tabs";

import { columns } from "@/app/admin/components/companies-columns";
import { bookmarksColumns } from "@/app/dashboard/components/bookmarks-columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";

import {
  BookmarkIcon,
  DashboardIcon,
  ExclamationTriangleIcon,
  GearIcon,
  PlusCircledIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";

export default function AdminPage() {
  const companies = useQuery(api.companies.listWithJobCounts);
  const errorStats = useQuery(api.companies.getErrorStats);

  const tabItems: TabItem[] = useMemo(
    () => [
      {
        value: "overview",
        label: "Overview",
        icon: <DashboardIcon className="size-4" />,
      },
      {
        value: "companies",
        label: "Companies",
        icon: <GearIcon className="size-4" />,
        badge: errorStats
          ? {
              count: errorStats.length,
              variant: "default",
            }
          : undefined,
      },

      {
        value: "errors",
        label: "Error Monitor",
        icon: <ExclamationTriangleIcon className="size-4" />,
        badge: errorStats
          ? {
              count: errorStats.filter((stat) => stat.isProblematic).length,
              variant:
                errorStats.filter((stat) => stat.isProblematic).length > 0
                  ? "red"
                  : "default",
            }
          : {
              loading: true,
            },
      },
    ],
    [errorStats],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage companies and monitor scraping operations
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/companies/add">
                <PlusCircledIcon className="mr-2 size-4" />
                Add Company
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList items={tabItems} />

          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">System Overview</h2>
              <p className="text-muted-foreground">
                High-level metrics and system health status
              </p>
            </div>

            <Suspense fallback={<div>Loading overview...</div>}>
              <OverviewContent />
            </Suspense>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Companies</h2>
                <p className="text-muted-foreground">
                  Manage company data and job board integrations
                </p>
              </div>
            </div>

            <Suspense fallback={<DataTableSkeleton columnCount={7} />}>
              <CompaniesTable />
            </Suspense>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Error Monitoring</h2>
              <p className="text-muted-foreground">
                Track and resolve scraping errors across all companies
              </p>
            </div>

            <Suspense fallback={<div>Loading error details...</div>}>
              <ErrorMonitoringContent />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewContent() {
  const errorStats = useQuery(api.companies.getErrorStats);

  if (!errorStats) {
    return <div>Loading...</div>;
  }

  const totalCompanies = errorStats.length;
  const problematicCompanies = errorStats.filter(
    (stat) => stat.isProblematic,
  ).length;
  const totalErrors = errorStats.reduce(
    (sum, stat) => sum + stat.recentErrorCount,
    0,
  );
  const healthyCompanies = totalCompanies - problematicCompanies;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <div className="text-sm text-muted-foreground">Total Companies</div>
            <div className="text-xs text-muted-foreground">
              Active job board integrations
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">
              {healthyCompanies}
            </div>
            <div className="text-sm text-muted-foreground">
              Healthy Companies
            </div>
            <div className="text-xs text-muted-foreground">
              Operating without issues
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600">
                {problematicCompanies}
              </div>
              {problematicCompanies > 0 && (
                <ExclamationTriangleIcon className="size-5 text-red-600" />
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Problematic Companies
            </div>
            <div className="text-xs text-muted-foreground">
              10+ errors in last 24h
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-orange-600">
              {totalErrors}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Errors (24h)
            </div>
            <div className="text-xs text-muted-foreground">
              Across all companies
            </div>
          </div>
        </Card>
      </div>

      {/* Health Status Summary */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Health Score</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      problematicCompanies === 0
                        ? "bg-green-500"
                        : problematicCompanies <= totalCompanies * 0.1
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.max(10, (healthyCompanies / totalCompanies) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round((healthyCompanies / totalCompanies) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {problematicCompanies === 0
                ? "All systems operating normally"
                : problematicCompanies <= totalCompanies * 0.1
                  ? "Minor issues detected, monitoring required"
                  : "Critical issues detected, immediate attention required"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ErrorMonitoringContent() {
  const errorStats = useQuery(api.companies.getErrorStats);

  if (!errorStats) {
    return <div>Loading...</div>;
  }

  const problematicCompanies = errorStats.filter((stat) => stat.isProblematic);

  return (
    <div className="space-y-6">
      {problematicCompanies.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <h3 className="text-lg font-semibold mb-2">No Critical Issues</h3>
            <p className="text-muted-foreground">
              All companies are operating within normal error thresholds
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <ExclamationTriangleIcon className="size-5" />
            <h3 className="text-lg font-semibold">
              {problematicCompanies.length} Companies Need Attention
            </h3>
          </div>

          <div className="grid gap-4">
            {problematicCompanies.map((company) => (
              <Card key={company.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{company.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {company.recentErrorCount} errors in last 24 hours
                    </p>
                  </div>
                  <Link href={`/admin/companies/${company.id}`}>
                    <Button variant="outline" size="sm" className="">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompaniesTable() {
  const companies = useQuery(api.companies.list);
  const router = useRouter();

  const { table } = useDataTable({
    data: companies || [],
    columns,
    pageCount: -1, // Client-side pagination
    initialState: {
      sorting: [{ id: "name", desc: false }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  if (!companies) {
    return <DataTableSkeleton columnCount={7} />;
  }

  return (
    <DataTable
      table={table}
      onRowClick={(row) => router.push(`/admin/companies/${row.original._id}`)}
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

function BookmarksTable() {
  const bookmarkedJobs = useQuery(api.bookmarks.listByUser);
  const removeBookmark = useMutation(api.bookmarks.remove);
  const router = useRouter();

  // Handle bookmark removal events
  useEffect(() => {
    const handleRemoveBookmark = async (event: Event) => {
      const customEvent = event as CustomEvent;
      try {
        await removeBookmark({ jobId: customEvent.detail.jobId });
      } catch (error) {
        console.error("Error removing bookmark:", error);
      }
    };

    window.addEventListener("removeBookmark", handleRemoveBookmark);
    return () => {
      window.removeEventListener("removeBookmark", handleRemoveBookmark);
    };
  }, [removeBookmark]);

  const { table } = useDataTable({
    data: bookmarkedJobs || [],
    columns: bookmarksColumns,
    pageCount: -1, // Client-side pagination
    initialState: {
      sorting: [{ id: "_creationTime", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  if (!bookmarkedJobs) {
    return <DataTableSkeleton columnCount={6} />;
  }

  if (bookmarkedJobs.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <BookmarkIcon className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Bookmarks Yet</h3>
          <p className="text-muted-foreground">
            Start bookmarking jobs you&apos;re interested in to track them here.
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
