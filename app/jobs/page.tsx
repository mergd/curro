"use client";

import type { JobFilters } from "./components";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { RequestCompanyDialog } from "@/components/request-company-dialog";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { jobsColumns, JobsFilter, JobsSearch } from "./components";

const initialFilters: JobFilters = {
  searchQuery: "",
  company: "",
  companyStage: [],
  companyCategory: [],
  country: [],
  city: [],
  timezone: [],
  remoteOption: [],
  roleType: [],
  employmentType: [],
  experienceRange: { min: undefined, max: undefined },
};

export default function JobsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<JobFilters>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] =
    useState<JobFilters>(initialFilters);
  const [isSearching, setIsSearching] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize search query from URL parameters
  useEffect(() => {
    if (!initialized) {
      const urlSearchQuery = searchParams.get("search");
      if (urlSearchQuery) {
        const newFilters = { ...initialFilters, searchQuery: urlSearchQuery };
        setFilters(newFilters);
        setDebouncedFilters(newFilters);
        setIsSearching(false); // Reset searching state
      }
      setInitialized(true);
    }
  }, [searchParams, initialized]);

  // Debounce search to avoid too many API calls
  const debouncedUpdateFilters = useDebouncedCallback(
    (newFilters: JobFilters) => {
      setDebouncedFilters(newFilters);
      setIsSearching(false);
    },
    300,
  );

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    setIsSearching(true);
    debouncedUpdateFilters(newFilters);
  };

  const updateFilter = (
    key: keyof JobFilters,
    value: string | string[] | { min?: number; max?: number },
  ) => {
    const newFilters = { ...filters, [key]: value };

    // Clear location filters when "Remote" is the only selected work type
    if (
      key === "remoteOption" &&
      Array.isArray(value) &&
      value.length === 1 &&
      value.includes("Remote")
    ) {
      newFilters.country = [];
      newFilters.city = [];
    }

    // Clear timezone when no remote work
    if (
      key === "remoteOption" &&
      Array.isArray(value) &&
      !value.includes("Remote")
    ) {
      newFilters.timezone = [];
    }

    setFilters(newFilters);

    // For non-search filters, update immediately
    if (key !== "searchQuery") {
      setDebouncedFilters(newFilters);
    } else {
      setIsSearching(true);
      debouncedUpdateFilters(newFilters);
    }
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setDebouncedFilters(initialFilters);
    setIsSearching(false);
  };

  return (
    <div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">All Opportunities</h2>
            <p className="text-muted-foreground">
              Browse and filter through all available positions
            </p>
          </div>
          <RequestCompanyDialog />
        </div>

        <Suspense
          fallback={<DataTableSkeleton columnCount={8} rowCount={15} />}
        >
          <JobsSearch
            searchQuery={filters.searchQuery}
            onSearchChange={handleSearch}
            isSearching={isSearching}
          />
          <JobsContent
            filters={debouncedFilters}
            currentFilters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            isSearching={isSearching}
          />
        </Suspense>
      </div>
    </div>
  );
}

function JobsContent({
  filters,
  currentFilters,
  updateFilter,
  clearFilters,
  isSearching,
}: {
  filters: JobFilters;
  currentFilters: JobFilters;
  updateFilter: (
    key: keyof JobFilters,
    value: string | string[] | { min?: number; max?: number },
  ) => void;
  clearFilters: () => void;
  isSearching: boolean;
}) {
  // Track pagination state manually since we need to sync with server
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([
    { id: "_creationTime", desc: true },
  ]);

  // Keep track of previous data to show stale results
  const [previousData, setPreviousData] = useState<any>(null);

  // Reset page when filters change
  const resetPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  useEffect(() => {
    resetPage();
  }, [filters, resetPage]);

  const offset = currentPage * pageSize;
  const sortBy = sorting.length > 0 ? sorting[0].id : "_creationTime";
  const sortOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

  // Prepare query arguments
  const queryArgs = useMemo(
    () => ({
      offset,
      limit: pageSize,
      searchQuery: filters.searchQuery || undefined,
      roleType: filters.roleType.length > 0 ? filters.roleType : undefined,
      employmentType:
        filters.employmentType.length > 0 ? filters.employmentType : undefined,
      remoteOption:
        filters.remoteOption.length > 0 ? filters.remoteOption : undefined,
      country: filters.country.length > 0 ? filters.country : undefined,
      city: filters.city.length > 0 ? filters.city : undefined,
      timezone: filters.timezone.length > 0 ? filters.timezone : undefined,
      companyStage:
        filters.companyStage.length > 0 ? filters.companyStage : undefined,
      companyCategory:
        filters.companyCategory.length > 0
          ? filters.companyCategory
          : undefined,
      experienceMin: filters.experienceRange?.min,
      experienceMax: filters.experienceRange?.max,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    }),
    [offset, pageSize, filters, sortBy, sortOrder],
  );

  const jobsResult = useQuery(api.jobs.searchJobs, queryArgs);

  // Update previous data when new data comes in
  useEffect(() => {
    if (jobsResult) {
      setPreviousData(jobsResult);
    }
  }, [jobsResult]);

  const tableData = jobsResult?.jobs || previousData?.jobs || [];
  const totalCount = jobsResult?.total || previousData?.total || 0;
  const pageCount = Math.ceil(totalCount / pageSize);

  // Determine if we should show stale data
  const isStale = isSearching || (!jobsResult && previousData);

  const { table } = useDataTable({
    data: tableData,
    columns: jobsColumns,
    pageCount: pageCount,
    initialState: {
      sorting: [{ id: "_creationTime", desc: true }],
      pagination: { pageIndex: currentPage, pageSize: pageSize },
    },
  });

  // Sync table state with our local state
  useEffect(() => {
    const tablePagination = table.getState().pagination;
    const tableSorting = table.getState().sorting;

    // Update page if table pagination changed
    if (tablePagination.pageIndex !== currentPage) {
      setCurrentPage(tablePagination.pageIndex);
    }

    // Update page size if changed
    if (tablePagination.pageSize !== pageSize) {
      setPageSize(tablePagination.pageSize);
    }

    // Update sorting if changed
    if (JSON.stringify(tableSorting) !== JSON.stringify(sorting)) {
      setSorting(tableSorting);
    }
  }, [
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    table.getState().sorting,
    currentPage,
    pageSize,
    sorting,
  ]);

  return (
    <div className="space-y-4">
      <JobsFilter
        filters={currentFilters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      <div
        className={`transition-opacity duration-200 ${isStale ? "opacity-60" : "opacity-100"}`}
      >
        <DataTable
          table={table}
          loading={!jobsResult && !previousData}
          emptyTitle="No jobs found"
          emptyDescription="Try adjusting your filters to see more results"
        />
      </div>
    </div>
  );
}
