"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { jobsColumns } from "@/components/jobs";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";

import { FunnelIcon, SortAscendingIcon } from "@phosphor-icons/react/dist/ssr";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Suspense, useState } from "react";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // You could implement actual search filtering here
    console.log("Searching for:", query);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with search */}
      <Header showSearch onSearch={handleSearch} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Opportunity
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore curated job listings from top companies and startups.
              Updated daily with the latest opportunities.
            </p>
          </div>

          {/* Quick filters could go here */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <FunnelIcon className="size-4" />
            <span>Use filters below to narrow your search</span>
            <SortAscendingIcon className="size-4" />
          </motion.div>
        </motion.div>

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">All Opportunities</h2>
              <p className="text-muted-foreground">
                Browse and filter through all available positions
              </p>
            </div>
          </div>

          <Suspense fallback={<DataTableSkeleton columnCount={8} />}>
            <JobsTable searchQuery={searchQuery} />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}

function JobsTable({ searchQuery }: { searchQuery: string }) {
  const jobs = useQuery(api.jobs.listAll, {});

  // Filter jobs based on search query
  const filteredJobs = jobs?.filter((job) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.company?.name?.toLowerCase().includes(query) ||
      job.locations?.some((location) =>
        location.toLowerCase().includes(query),
      ) ||
      job.roleType?.toLowerCase().includes(query)
    );
  });

  const { table } = useDataTable({
    data: filteredJobs || [],
    columns: jobsColumns,
    pageCount: -1, // Client-side pagination
    initialState: {
      sorting: [{ id: "_creationTime", desc: true }],
      pagination: { pageIndex: 0, pageSize: 15 },
    },
  });

  if (!jobs) {
    return <DataTableSkeleton columnCount={8} />;
  }

  return (
    <div className="space-y-4">
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-sm text-blue-800">
            {filteredJobs?.length === 0 ? (
              <>
                No jobs found for "<strong>{searchQuery}</strong>". Try a
                different search term.
              </>
            ) : (
              <>
                Showing {filteredJobs?.length} result
                {filteredJobs?.length !== 1 ? "s" : ""} for "
                <strong>{searchQuery}</strong>"
              </>
            )}
          </p>
        </motion.div>
      )}

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
