import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-tag-select";
import {
  ALL_FILTER_VALUE,
  COMPANY_CATEGORIES,
  COMPANY_STAGES,
  EMPLOYEE_COUNT_RANGES,
  LOCATION_HIERARCHY,
} from "@/lib/constants";

import {
  CaretDownIcon,
  CaretUpIcon,
  FunnelIcon,
  SlidersIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

interface CompanyFilters {
  searchQuery: string;
  stage: string[];
  category: string[];
  size: string[];
  country: string[];
  city: string[];
  hasJobs: boolean | undefined; // true = has jobs, false = no jobs, undefined = all
}

interface CompaniesFilterProps {
  filters: CompanyFilters;
  onFilterChange: (
    key: keyof CompanyFilters,
    value: string | string[] | boolean | undefined,
  ) => void;
  onClearFilters: () => void;
}

interface CompaniesSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function CompaniesSearch({
  searchQuery,
  onSearchChange,
}: CompaniesSearchProps) {
  return (
    <Card className="p-4 mb-4">
      <div className="space-y-2">
        <Label htmlFor="company-search" className="text-sm font-medium">
          Search Companies
        </Label>
        <Input
          id="company-search"
          placeholder="Search by company name, description, or industry..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          Search across company names, descriptions, and industry categories
        </p>
      </div>
    </Card>
  );
}

export function CompaniesFilter({
  filters,
  onFilterChange,
  onClearFilters,
}: CompaniesFilterProps) {
  const [showActiveFilters, setShowActiveFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showPrimaryFilters, setShowPrimaryFilters] = useState(true);

  const activeFiltersList = Object.entries(filters)
    .filter(([key, value]) => {
      // Skip searchQuery since it's handled separately
      if (key === "searchQuery") return false;

      if (key === "hasJobs") {
        return value !== undefined;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== "" && value !== ALL_FILTER_VALUE && value !== undefined;
    })
    .map(([key, value]) => {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      // Get display value for select options
      let displayValue: string;
      if (key === "hasJobs") {
        displayValue = value ? "Has open jobs" : "No open jobs";
      } else if (Array.isArray(value)) {
        if (key === "country") {
          displayValue = value
            .map((countryCode) => {
              const country = Object.entries(LOCATION_HIERARCHY).find(
                ([code]) => code === countryCode,
              );
              return country ? country[1].name : countryCode;
            })
            .join(", ");
        } else {
          displayValue = value.join(", ");
        }
      } else {
        displayValue = value as string;
      }

      return {
        key,
        value,
        displayValue,
        label,
      };
    });

  const hasActiveFilters = activeFiltersList.length > 0;

  // Generate city options based on country selection
  const getCityOptions = () => {
    const countries =
      filters.country.length === 0
        ? Object.entries(LOCATION_HIERARCHY)
        : Object.entries(LOCATION_HIERARCHY).filter(([code]) =>
            filters.country.includes(code),
          );

    const allCities = countries.flatMap(([, data]) => [...data.cities]);

    // Sort cities: starred first (with semibold), then alphabetically
    const sortedCities = allCities.sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return a.name.localeCompare(b.name);
    });

    return sortedCities.map((city) => ({
      value: city.name,
      label: city.name,
      starred: city.starred,
    }));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="size-4" />
            <h3 className="font-medium">Filters</h3>
            {activeFiltersList.length > 0 && (
              <Badge variant="default" className="text-xs">
                {activeFiltersList.length}
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        {/* Primary Filters Toggle */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => setShowPrimaryFilters(!showPrimaryFilters)}
            className="text-sm text-muted-foreground hover:text-foreground px-0 mb-3"
          >
            <FunnelIcon className="size-4 mr-2" />
            Primary Filters
            {showPrimaryFilters ? (
              <CaretUpIcon className="size-4 ml-2" />
            ) : (
              <CaretDownIcon className="size-4 ml-2" />
            )}
          </Button>

          {showPrimaryFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="stage-filter" className="text-sm font-medium">
                  Stage
                </Label>
                <MultiSelect
                  options={COMPANY_STAGES.map((stage) => ({
                    value: stage,
                    label: stage,
                  }))}
                  value={filters.stage}
                  onValueChange={(value) => onFilterChange("stage", value)}
                  placeholder="Any stage"
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="category-filter"
                  className="text-sm font-medium"
                >
                  Industry
                </Label>
                <MultiSelect
                  options={COMPANY_CATEGORIES.map((category) => ({
                    value: category,
                    label: category,
                  }))}
                  value={filters.category}
                  onValueChange={(value) => onFilterChange("category", value)}
                  placeholder="Any industry"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="size-filter" className="text-sm font-medium">
                  Company Size
                </Label>
                <MultiSelect
                  options={EMPLOYEE_COUNT_RANGES.map((range) => ({
                    value: range,
                    label: `${range} employees`,
                  }))}
                  value={filters.size}
                  onValueChange={(value) => onFilterChange("size", value)}
                  placeholder="Any size"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="jobs-filter" className="text-sm font-medium">
                  Job Availability
                </Label>
                <MultiSelect
                  options={[
                    { value: "has-jobs", label: "Has open jobs" },
                    { value: "no-jobs", label: "No open jobs" },
                  ]}
                  value={
                    filters.hasJobs === true
                      ? ["has-jobs"]
                      : filters.hasJobs === false
                        ? ["no-jobs"]
                        : []
                  }
                  onValueChange={(value) => {
                    if (value.length === 0) {
                      onFilterChange("hasJobs", undefined);
                    } else if (value.includes("has-jobs")) {
                      onFilterChange("hasJobs", true);
                    } else if (value.includes("no-jobs")) {
                      onFilterChange("hasJobs", false);
                    }
                  }}
                  placeholder="Any availability"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <div className="border-t pt-3">
          <Button
            variant="ghost"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-muted-foreground hover:text-foreground px-0"
          >
            <SlidersIcon className="size-4 mr-2" />
            Location Filters
            {showAdvancedFilters ? (
              <CaretUpIcon className="size-4 ml-2" />
            ) : (
              <CaretDownIcon className="size-4 ml-2" />
            )}
          </Button>

          {showAdvancedFilters && (
            <div className="mt-3 pt-3 border-t space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Geographic Locations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="country-filter"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Country
                  </Label>
                  <MultiSelect
                    options={Object.entries(LOCATION_HIERARCHY).map(
                      ([code, data]) => ({
                        value: code,
                        label: data.name,
                      }),
                    )}
                    value={filters.country}
                    onValueChange={(value) => {
                      onFilterChange("country", value);
                      // Clear city filter when countries change
                      if (value.length === 0) {
                        onFilterChange("city", []);
                      }
                    }}
                    placeholder="Any country"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="city-filter"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    City
                  </Label>
                  <MultiSelect
                    options={getCityOptions()}
                    value={filters.city}
                    onValueChange={(value) => onFilterChange("city", value)}
                    placeholder="Any city"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {hasActiveFilters && (
        <Card className="p-3">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowActiveFilters(!showActiveFilters)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Active Filters</span>
              <Badge variant="default" className="text-xs">
                {activeFiltersList.length}
              </Badge>
            </div>
            {showActiveFilters ? (
              <CaretUpIcon className="size-4" />
            ) : (
              <CaretDownIcon className="size-4" />
            )}
          </div>

          {showActiveFilters && (
            <div className="mt-3 space-y-2">
              {activeFiltersList.map(({ key, value, displayValue, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground min-w-[80px]">
                      {label}
                    </span>
                    <span className="text-sm">{displayValue}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const arrayFields = [
                        "stage",
                        "category",
                        "size",
                        "country",
                        "city",
                      ];
                      const booleanFields = ["hasJobs"];

                      if (arrayFields.includes(key)) {
                        onFilterChange(key as keyof CompanyFilters, []);
                      } else if (booleanFields.includes(key)) {
                        onFilterChange(key as keyof CompanyFilters, undefined);
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    title={`Clear ${label.toLowerCase()}`}
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export type { CompanyFilters };
