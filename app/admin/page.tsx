"use client";

import { columns } from "@/app/admin/components/companies-columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";

import { ExclamationTriangleIcon, PlusIcon } from "@radix-ui/react-icons";
import { Card } from "@radix-ui/themes";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export default function AdminPage() {
  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage companies and monitor scraping status
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading error stats...</div>}>
        <ErrorStatsCards />
      </Suspense>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Companies</h2>
            <p className="text-muted-foreground">
              Manage company data and job board integrations
            </p>
          </div>
          <Link href="/admin/companies/add">
            <Button className="cursor-pointer">
              <PlusIcon className="mr-2 size-4" />
              Add Company
            </Button>
          </Link>
        </div>

        <Suspense fallback={<DataTableSkeleton columnCount={7} />}>
          <CompaniesTable />
        </Suspense>
      </div>
    </div>
  );
}

function ErrorStatsCards() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="space-y-2">
          <div className="text-2xl font-bold">{totalCompanies}</div>
          <div className="text-sm text-muted-foreground">Total Companies</div>
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
            Companies with 10+ errors in 24h
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
        </div>
      </Card>
    </div>
  );
}

function CompaniesTable() {
  const companies = useQuery(api.companies.list);
  const router = useRouter();

  const { table } = useDataTable({
    data: companies || [],
    columns,
    pageCount: Math.ceil((companies?.length || 0) / 10),
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
