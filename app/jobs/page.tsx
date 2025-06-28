"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { jobsColumns } from "@/components/jobs";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";

import { PlusIcon } from "@radix-ui/react-icons";
import { useQuery } from "convex/react";
import { Suspense } from "react";

import { api } from "../../convex/_generated/api";

export default function JobsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Listings</h1>
          <p className="text-muted-foreground">
            Discover and manage job opportunities from top companies
          </p>
        </div>
        <Button className="cursor-pointer">
          <PlusIcon className="mr-2 size-4" />
          Add Job
        </Button>
      </div>

      <Suspense fallback={<DataTableSkeleton columnCount={8} />}>
        <JobsTable />
      </Suspense>
    </div>
  );
}

function JobsTable() {
  const jobs = useQuery(api.jobs.listAll, {});

  const { table } = useDataTable({
    data: jobs || [],
    columns: jobsColumns,
    pageCount: -1, // Client-side pagination
    initialState: {
      sorting: [{ id: "_creationTime", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  if (!jobs) {
    return <DataTableSkeleton columnCount={8} />;
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
