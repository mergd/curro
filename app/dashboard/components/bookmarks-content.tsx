"use client";

import { bookmarksColumns } from "@/app/dashboard/components/bookmarks-columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";

import { BookmarkIcon } from "@radix-ui/react-icons";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function BookmarksContent() {
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
          <p className="text-muted-foreground mb-4">
            Start exploring and bookmark jobs you&apos;re interested in.
          </p>
          <Button asChild>
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <DataTable
      table={table}
      onRowClick={(row) => {
        router.push(`/jobs/${row.original._id}`);
      }}
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
