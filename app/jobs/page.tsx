"use client";

import type { JobFilters } from "./components";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";
import { ALL_FILTER_VALUE } from "@/lib/constants";

import { useQuery } from "convex/react";
import { Suspense, useMemo, useState } from "react";

import { jobsColumns, JobsFilter } from "./components";

const initialFilters: JobFilters = {
  searchQuery: "",
  company: "",
  companyStage: [],
  companyCategory: [],
  location: "",
  remoteOption: [],
  country: "",
  city: "",
  roleType: [],
  employmentType: [],
};

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>(initialFilters);

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const updateFilter = (key: keyof JobFilters, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch onSearch={handleSearch} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">All Opportunities</h2>
            <p className="text-muted-foreground">
              Browse and filter through all available positions
            </p>
          </div>
        </div>

        <Suspense
          fallback={<DataTableSkeleton columnCount={8} rowCount={15} />}
        >
          <JobsContent
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
          />
        </Suspense>
      </div>
    </div>
  );
}

function JobsContent({
  filters,
  updateFilter,
  clearFilters,
}: {
  filters: JobFilters;
  updateFilter: (key: keyof JobFilters, value: string | string[]) => void;
  clearFilters: () => void;
}) {
  const jobs = useQuery(api.jobs.listAll, {});

  // Enhanced filtering logic
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    return jobs.filter((job) => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          job.title.toLowerCase().includes(query) ||
          job.company?.name?.toLowerCase().includes(query) ||
          job.locations?.some((location) =>
            location.toLowerCase().includes(query),
          ) ||
          job.roleType?.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Company filter
      if (filters.company) {
        const companyQuery = filters.company.toLowerCase();
        const matchesCompany = job.company?.name
          ?.toLowerCase()
          .includes(companyQuery);
        if (!matchesCompany) return false;
      }

      // Role type filter
      if (filters.roleType && filters.roleType.length > 0) {
        if (!filters.roleType.includes(job.roleType || "")) return false;
      }

      // Employment type filter
      if (filters.employmentType && filters.employmentType.length > 0) {
        if (!filters.employmentType.includes(job.employmentType || ""))
          return false;
      }

      // Company stage filter
      if (filters.companyStage && filters.companyStage.length > 0) {
        if (!filters.companyStage.includes(job.company?.stage || ""))
          return false;
      }

      // Company category filter
      if (filters.companyCategory && filters.companyCategory.length > 0) {
        if (
          !job.company?.category?.some((category) =>
            filters.companyCategory.includes(category),
          )
        )
          return false;
      }

      // Remote option filter
      if (filters.remoteOption && filters.remoteOption.length > 0) {
        if (!filters.remoteOption.includes(job.remoteOptions || ""))
          return false;
      }

      // Country filter (improved - looks for country codes in locations)
      if (filters.country) {
        const countryQuery = filters.country.toLowerCase();
        const matchesCountry = job.locations?.some((location) => {
          const locationLower = location.toLowerCase();
          // Check if location ends with country code (e.g., "London, GBR")
          return (
            locationLower.endsWith(countryQuery) ||
            locationLower.includes(`, ${countryQuery}`) ||
            locationLower.includes(countryQuery)
          );
        });
        if (!matchesCountry && job.remoteOptions !== "Remote") return false;
      }

      // City filter (improved - looks specifically for city names)
      if (filters.city) {
        const cityQuery = filters.city.toLowerCase();
        const matchesCity = job.locations?.some((location) => {
          const locationLower = location.toLowerCase();
          // Check if location starts with city name or contains city name before comma
          return (
            locationLower.startsWith(cityQuery) ||
            locationLower.includes(`${cityQuery},`) ||
            locationLower === cityQuery
          );
        });
        if (!matchesCity && job.remoteOptions !== "Remote") return false;
      }

      // General location filter (fallback for any location text)
      if (filters.location) {
        const locationQuery = filters.location.toLowerCase();
        const matchesLocation = job.locations?.some((location) =>
          location.toLowerCase().includes(locationQuery),
        );
        if (!matchesLocation && job.remoteOptions !== "Remote") return false;
      }

      return true;
    });
  }, [jobs, filters]);

  const { table } = useDataTable({
    data: filteredJobs || [],
    columns: jobsColumns,
    pageCount: Math.ceil((filteredJobs?.length || 0) / 15),
    initialState: {
      sorting: [{ id: "_creationTime", desc: true }],
      pagination: { pageIndex: 0, pageSize: 15 },
    },
  });

  return (
    <div className="space-y-4">
      <JobsFilter
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      <DataTable
        table={table}
        loading={!jobs}
        emptyTitle="No jobs found"
        emptyDescription="Try adjusting your filters to see more results"
      ></DataTable>
    </div>
  );
}
