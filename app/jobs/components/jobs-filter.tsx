import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-tag-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimezoneDropdown } from "@/components/ui/timezone-dropdown";
import {
  ALL_FILTER_VALUE,
  COMPANY_CATEGORIES,
  COMPANY_STAGE_MAPPING,
  COMPANY_STAGE_META_CATEGORIES,
  COMPANY_STAGES,
  EMPLOYMENT_TYPE_OPTIONS,
  LOCATION_HIERARCHY,
  REMOTE_OPTIONS,
  ROLE_TYPE_OPTIONS,
  TIMEZONES,
} from "@/lib/constants";

import {
  CaretDownIcon,
  CaretUpIcon,
  FunnelIcon,
  SlidersIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

interface JobFilters {
  searchQuery: string;
  company: string;
  companyStage: string[];
  companyCategory: string[];
  country: string[];
  city: string[];
  timezone: string[];
  remoteOption: string[];
  roleType: string[];
  employmentType: string[];
  // salaryRange: { min?: number; max?: number }; // Removed - need to handle hourly vs annual salaries differently
  experienceRange: { min?: number; max?: number };
}

interface JobsFilterProps {
  filters: JobFilters;
  onFilterChange: (
    key: keyof JobFilters,
    value: string | string[] | { min?: number; max?: number },
  ) => void;
  onClearFilters: () => void;
}

interface JobsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching?: boolean;
}

export function JobsSearch({
  searchQuery,
  onSearchChange,
  isSearching,
}: JobsSearchProps) {
  return (
    <Card className="p-4 mb-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="global-search" className="text-sm font-medium">
            Search Jobs
          </Label>
          {isSearching && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="size-3 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
              <span>Searching...</span>
            </div>
          )}
        </div>
        <Input
          id="global-search"
          placeholder="Search job titles, companies, locations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          Full-text search across job titles with intelligent filtering
        </p>
      </div>
    </Card>
  );
}

export function JobsFilter({
  filters,
  onFilterChange,
  onClearFilters,
}: JobsFilterProps) {
  const [showActiveFilters, setShowActiveFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showPrimaryFilters, setShowPrimaryFilters] = useState(true);

  const activeFiltersList = Object.entries(filters)
    .filter(([key, value]) => {
      // Skip searchQuery and company since they're handled separately
      if (key === "searchQuery" || key === "company") return false;

      if (key === "location") {
        return (
          value && typeof value === "object" && value.country && value.city
        );
      }
      if (key === "experienceRange") {
        return (
          value &&
          typeof value === "object" &&
          (value.min !== undefined || value.max !== undefined)
        );
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
      if (key === "experienceRange") {
        const range = value as { min?: number; max?: number };
        if (range.min && range.max) {
          displayValue = `${range.min}-${range.max} years`;
        } else if (range.min) {
          displayValue = `${range.min}+ years`;
        } else if (range.max) {
          displayValue = `Up to ${range.max} years`;
        } else {
          displayValue = "";
        }
      } else if (Array.isArray(value)) {
        if (key === "roleType") {
          displayValue = value
            .map(
              (v) =>
                ROLE_TYPE_OPTIONS.find((opt) => opt.value === v)?.label || v,
            )
            .join(", ");
        } else if (key === "employmentType") {
          displayValue = value
            .map(
              (v) =>
                EMPLOYMENT_TYPE_OPTIONS.find((opt) => opt.value === v)?.label ||
                v,
            )
            .join(", ");
        } else if (key === "remoteOption") {
          displayValue = value
            .map((v) => (v === "On-Site" ? "On-site" : v))
            .join(", ");
        } else if (key === "country") {
          displayValue = value
            .map((countryCode) => {
              const country = Object.entries(LOCATION_HIERARCHY).find(
                ([code]) => code === countryCode,
              );
              return country ? country[1].name : countryCode;
            })
            .join(", ");
        } else if (key === "companyStage") {
          // Convert individual stages to meta categories for display
          const selectedMetaCategories: string[] = [];

          for (const [metaCategory, stages] of Object.entries(
            COMPANY_STAGE_MAPPING,
          )) {
            if (stages.some((stage) => value.includes(stage))) {
              selectedMetaCategories.push(metaCategory);
            }
          }

          displayValue = selectedMetaCategories.join(", ");
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

  // Check if work type is only "Remote"
  const isRemoteOnly =
    filters.remoteOption.length === 1 &&
    filters.remoteOption.includes("Remote");

  // Check if Remote is included (for showing timezone)
  const includesRemote =
    filters.remoteOption.includes("Remote") ||
    filters.remoteOption.length === 0;

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
                <Label
                  htmlFor="role-type-filter"
                  className="text-sm font-medium"
                >
                  Role Type
                </Label>
                <MultiSelect
                  options={ROLE_TYPE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  value={filters.roleType}
                  onValueChange={(value) => onFilterChange("roleType", value)}
                  placeholder="Any role type"
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="employment-type-filter"
                  className="text-sm font-medium"
                >
                  Employment Type
                </Label>
                <MultiSelect
                  options={EMPLOYMENT_TYPE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  value={filters.employmentType}
                  onValueChange={(value) =>
                    onFilterChange("employmentType", value)
                  }
                  placeholder="Any employment type"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="remote-filter" className="text-sm font-medium">
                  Work Type
                </Label>
                <MultiSelect
                  options={REMOTE_OPTIONS.map((option) => ({
                    value: option,
                    label: option === "On-Site" ? "On-site" : option,
                  }))}
                  value={filters.remoteOption}
                  onValueChange={(value) =>
                    onFilterChange("remoteOption", value)
                  }
                  placeholder="Any work type"
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="experience-filter"
                  className="text-sm font-medium"
                >
                  Years of Experience
                </Label>
                <Select
                  value={(() => {
                    if (
                      !filters.experienceRange ||
                      (filters.experienceRange.min === undefined &&
                        filters.experienceRange.max === undefined)
                    ) {
                      return "all";
                    }

                    const { min, max } = filters.experienceRange;

                    // Map back to dropdown values
                    if (min === 0 && max === 1) return "0-1";
                    if (min === 2 && max === 3) return "2-3";
                    if (min === 4 && max === 6) return "4-6";
                    if (min === 7 && max === 10) return "7-10";
                    if (min === 11 && max === 15) return "11-15";
                    if (min === 15 && max === undefined) return "15+";

                    return "all";
                  })()}
                  onValueChange={(value) => {
                    if (value === "all") {
                      onFilterChange("experienceRange", {
                        min: undefined,
                        max: undefined,
                      });
                    } else if (value === "15+") {
                      onFilterChange("experienceRange", {
                        min: 15,
                        max: undefined,
                      });
                    } else {
                      const [min, max] = value.split("-").map(Number);
                      onFilterChange("experienceRange", { min, max });
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Any experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any experience level</SelectItem>
                    <SelectItem value="0-1">0-1 years (Entry level)</SelectItem>
                    <SelectItem value="2-3">2-3 years (Junior)</SelectItem>
                    <SelectItem value="4-6">4-6 years (Mid-level)</SelectItem>
                    <SelectItem value="7-10">7-10 years (Senior)</SelectItem>
                    <SelectItem value="11-15">
                      11-15 years (Staff/Principal)
                    </SelectItem>
                    <SelectItem value="15+">15+ years (Executive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range removed - need to handle hourly vs annual salaries differently */}

              {!isRemoteOnly && (
                <>
                  <div>
                    <Label
                      htmlFor="country-filter"
                      className="text-sm font-medium"
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
                      onValueChange={(value) =>
                        onFilterChange("country", value)
                      }
                      placeholder="Any country"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="city-filter"
                      className="text-sm font-medium"
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
                </>
              )}

              {includesRemote && (
                <div>
                  <Label
                    htmlFor="timezone-filter"
                    className="text-sm font-medium"
                  >
                    Timezone
                  </Label>
                  <MultiSelect
                    options={TIMEZONES.map((tz) => ({
                      value: tz.value,
                      label: tz.label,
                    }))}
                    value={filters.timezone}
                    onValueChange={(value) => onFilterChange("timezone", value)}
                    placeholder="Any timezone"
                    className="mt-1"
                  />
                </div>
              )}
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
            Company Filters
            {showAdvancedFilters ? (
              <CaretUpIcon className="size-4 ml-2" />
            ) : (
              <CaretDownIcon className="size-4 ml-2" />
            )}
          </Button>

          {showAdvancedFilters && (
            <div className="mt-3 pt-3 border-t space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Company Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="stage-filter"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Company Stage
                  </Label>
                  <MultiSelect
                    options={COMPANY_STAGE_META_CATEGORIES.map(
                      (metaCategory) => ({
                        value: metaCategory,
                        label: metaCategory,
                      }),
                    )}
                    value={(() => {
                      // Convert selected individual stages back to meta categories
                      const selectedMetaCategories: string[] = [];

                      for (const [metaCategory, stages] of Object.entries(
                        COMPANY_STAGE_MAPPING,
                      )) {
                        if (
                          stages.some((stage) =>
                            filters.companyStage.includes(stage),
                          )
                        ) {
                          selectedMetaCategories.push(metaCategory);
                        }
                      }

                      return selectedMetaCategories;
                    })()}
                    onValueChange={(selectedMetaCategories) => {
                      // Convert meta categories to individual stages
                      const individualStages: string[] = [];

                      for (const metaCategory of selectedMetaCategories) {
                        const stages =
                          COMPANY_STAGE_MAPPING[
                            metaCategory as keyof typeof COMPANY_STAGE_MAPPING
                          ];
                        individualStages.push(...stages);
                      }

                      onFilterChange("companyStage", individualStages);
                    }}
                    placeholder="Any stage"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="category-filter"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Company Category
                  </Label>
                  <MultiSelect
                    options={COMPANY_CATEGORIES.map((category) => ({
                      value: category,
                      label: category,
                    }))}
                    value={filters.companyCategory}
                    onValueChange={(value) =>
                      onFilterChange("companyCategory", value)
                    }
                    placeholder="Any category"
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
                    <span className="text-xs font-medium text-muted-foreground min-w-[100px]">
                      {label}
                    </span>
                    <span className="text-sm">{displayValue}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const stringFields = ["searchQuery", "company"];
                      const arrayFields = [
                        "roleType",
                        "employmentType",
                        "remoteOption",
                        "companyStage",
                        "companyCategory",
                        "country",
                        "city",
                        "timezone",
                      ];
                      const rangeFields = ["experienceRange"];

                      if (stringFields.includes(key)) {
                        onFilterChange(key as keyof JobFilters, "");
                      } else if (arrayFields.includes(key)) {
                        onFilterChange(key as keyof JobFilters, []);
                      } else if (rangeFields.includes(key)) {
                        onFilterChange(key as keyof JobFilters, {
                          min: undefined,
                          max: undefined,
                        });
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

export type { JobFilters };
