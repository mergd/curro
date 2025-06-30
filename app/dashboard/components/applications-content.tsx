"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";

import { FileTextIcon } from "@radix-ui/react-icons";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { applicationsColumns } from "./applications-columns";

export function ApplicationsContent() {
  const applications = useQuery(api.applications.listByUser, {});
  const router = useRouter();

  const { table } = useDataTable({
    data: applications || [],
    columns: applicationsColumns,
    pageCount: Math.ceil((applications?.length || 0) / 10),
    initialState: {
      sorting: [{ id: "lastUpdated", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  if (!applications) {
    return <DataTableSkeleton columnCount={7} />;
  }

  if (applications.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <FileTextIcon className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start applying to jobs and track your progress here.
          </p>
          <Button asChild>
            <Link href="/jobs">Find Jobs to Apply</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <DataTable
      table={table}
      onRowClick={(row) => {
        if (row.original.job?._id) {
          router.push(`/jobs/${row.original.job._id}`);
        }
      }}
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
