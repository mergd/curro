"use client";

import type { CompanyFilters } from "./components";
import type { CompanyWithJobCount } from "./components";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { useDataTable } from "@/hooks/use-data-table";

import { useQuery } from "convex/react";
import { Suspense, useMemo, useState } from "react";

import {
  companiesColumns,
  CompaniesFilter,
  CompaniesSearch,
} from "./components";

const initialFilters: CompanyFilters = {
  searchQuery: "",
  stage: [],
  category: [],
  size: [],
  country: [],
  city: [],
  hasJobs: undefined,
};

export default function CompaniesPage() {
  const [filters, setFilters] = useState<CompanyFilters>(initialFilters);

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const updateFilter = (
    key: keyof CompanyFilters,
    value: string | string[] | boolean | undefined,
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Clear city filter when country changes
      if (key === "country" && Array.isArray(value) && value.length === 0) {
        newFilters.city = [];
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
            <h2 className="text-2xl font-semibold">Company Directory</h2>
            <p className="text-muted-foreground">
              Browse and filter through all companies on the platform
            </p>
          </div>
        </div>

        <Suspense
          fallback={<DataTableSkeleton columnCount={8} rowCount={15} />}
        >
          <CompaniesSearch
            searchQuery={filters.searchQuery}
            onSearchChange={(query) => updateFilter("searchQuery", query)}
          />
          <CompaniesContent
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
          />
        </Suspense>
      </div>
    </div>
  );
}

function CompaniesContent({
  filters,
  updateFilter,
  clearFilters,
}: {
  filters: CompanyFilters;
  updateFilter: (
    key: keyof CompanyFilters,
    value: string | string[] | boolean | undefined,
  ) => void;
  clearFilters: () => void;
}) {
  const companies = useQuery(api.companies.listWithJobCounts);

  // Enhanced filtering logic
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];

    return companies.filter((company) => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          company.name.toLowerCase().includes(query) ||
          company.description?.toLowerCase().includes(query) ||
          company.category?.some((cat) => cat.toLowerCase().includes(query)) ||
          company.tags?.some((tag) => tag.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Stage filter
      if (filters.stage && filters.stage.length > 0) {
        if (!filters.stage.includes(company.stage || "")) return false;
      }

      // Category filter
      if (filters.category && filters.category.length > 0) {
        if (
          !company.category?.some((category) =>
            filters.category.includes(category),
          )
        )
          return false;
      }

      // Size filter
      if (filters.size && filters.size.length > 0) {
        if (!filters.size.includes(company.numberOfEmployees || ""))
          return false;
      }

      // Country filter
      if (filters.country && filters.country.length > 0) {
        const matchesCountry = company.locations?.some((location) => {
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
        if (!matchesCountry) return false;
      }

      // City filter
      if (filters.city && filters.city.length > 0) {
        const matchesCity = company.locations?.some((location) => {
          const locationLower = location.toLowerCase();
          return filters.city.some((city) => {
            const cityLower = city.toLowerCase();
            return (
              locationLower.startsWith(cityLower) ||
              locationLower.includes(`${cityLower},`) ||
              locationLower === cityLower ||
              locationLower.includes(cityLower)
            );
          });
        });
        if (!matchesCity) return false;
      }

      // Job availability filter
      if (filters.hasJobs !== undefined) {
        const hasOpenJobs = company.jobCount > 0;
        if (filters.hasJobs && !hasOpenJobs) return false;
        if (!filters.hasJobs && hasOpenJobs) return false;
      }

      return true;
    });
  }, [companies, filters]);

  const { table } = useDataTable({
    data: filteredCompanies || [],
    columns: companiesColumns,
    pageCount: Math.ceil((filteredCompanies?.length || 0) / 15),
    initialState: {
      sorting: [{ id: "jobCount", desc: true }],
      pagination: { pageIndex: 0, pageSize: 15 },
    },
  });

  return (
    <div className="space-y-4">
      <CompaniesFilter
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      <DataTable
        table={table}
        loading={!companies}
        emptyTitle="No companies found"
        emptyDescription="Try adjusting your filters to see more results"
        onRowClick={(row) => {
          // Navigate to company page
          window.location.href = `/companies/${row.original._id}`;
        }}
      />
    </div>
  );
}
