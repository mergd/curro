"use client";

import type { JobFilters } from "./components";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";

import { useQuery } from "convex/react";
import { Suspense, useMemo, useState } from "react";

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
  // salaryRange: { min: undefined, max: undefined }, // Removed - need to handle hourly vs annual salaries differently
  experienceRange: { min: undefined, max: undefined },
};

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>(initialFilters);

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const updateFilter = (
    key: keyof JobFilters,
    value: string | string[] | { min?: number; max?: number },
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

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

      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
          <JobsSearch
            searchQuery={filters.searchQuery}
            onSearchChange={(query) => updateFilter("searchQuery", query)}
          />
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
  updateFilter: (
    key: keyof JobFilters,
    value: string | string[] | { min?: number; max?: number },
  ) => void;
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

      // Country filter
      if (filters.country && filters.country.length > 0) {
        const matchesCountry = job.locations?.some((location) => {
          const locationLower = location.toLowerCase();
          return filters.country.some((countryCode) => {
            const countryCodeLower = countryCode.toLowerCase();
            return (
              locationLower.endsWith(countryCodeLower) ||
              locationLower.includes(`, ${countryCodeLower}`) ||
              locationLower.includes(countryCodeLower)
            );
          });
        });
        if (!matchesCountry && job.remoteOptions !== "Remote") return false;
      }

      // City filter
      if (filters.city && filters.city.length > 0) {
        const matchesCity = job.locations?.some((location) => {
          const locationLower = location.toLowerCase();
          return filters.city.some((city) => {
            if (city === "all") return true;
            const cityLower = city.toLowerCase();
            return (
              locationLower.startsWith(cityLower) ||
              locationLower.includes(`${cityLower},`) ||
              locationLower === cityLower ||
              locationLower.includes(cityLower)
            );
          });
        });
        if (!matchesCity && job.remoteOptions !== "Remote") return false;
      }

      // Timezone filter (for remote jobs)
      if (
        filters.timezone &&
        filters.timezone.length > 0 &&
        job.remoteOptions === "Remote"
      ) {
        // For now, timezone filtering would require additional job data
        // This is a placeholder for future timezone-based filtering
        // In practice, you'd need timezone info in job data
      }

      // Salary range filter removed - need to handle hourly vs annual salaries differently

      // Experience range filter
      if (
        filters.experienceRange &&
        (filters.experienceRange.min !== undefined ||
          filters.experienceRange.max !== undefined)
      ) {
        if (job.yearsOfExperience?.min !== undefined) {
          const jobExperience = job.yearsOfExperience.min;
          if (
            filters.experienceRange.min !== undefined &&
            jobExperience < filters.experienceRange.min
          ) {
            return false;
          }
          if (
            filters.experienceRange.max !== undefined &&
            jobExperience > filters.experienceRange.max
          ) {
            return false;
          }
        } else if (
          filters.experienceRange.min !== undefined &&
          filters.experienceRange.min > 0
        ) {
          // If filter has a minimum but job has no experience info, exclude it
          return false;
        }
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
