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
  EMPLOYMENT_TYPE_OPTIONS,
  REMOTE_OPTIONS,
  ROLE_TYPE_OPTIONS,
} from "@/lib/constants";

import {
  CaretDownIcon,
  CaretUpIcon,
  FunnelIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

interface JobFilters {
  searchQuery: string;
  company: string;
  companyStage: string[];
  companyCategory: string[];
  location: string;
  remoteOption: string[];
  country: string;
  city: string;
  roleType: string[];
  employmentType: string[];
}

interface JobsFilterProps {
  filters: JobFilters;
  onFilterChange: (key: keyof JobFilters, value: string | string[]) => void;
  onClearFilters: () => void;
}

export function JobsFilter({
  filters,
  onFilterChange,
  onClearFilters,
}: JobsFilterProps) {
  const [showActiveFilters, setShowActiveFilters] = useState(false);

  const activeFiltersList = Object.entries(filters)
    .filter(([_, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== "" && value !== ALL_FILTER_VALUE;
    })
    .map(([key, value]) => {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      // Get display value for select options
      let displayValue: string;
      if (Array.isArray(value)) {
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
        } else {
          displayValue = value.join(", ");
        }
      } else {
        displayValue = value;
      }

      return {
        key,
        value,
        displayValue,
        label,
      };
    });

  const hasActiveFilters = activeFiltersList.length > 0;

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="company-filter" className="text-sm font-medium">
              Company
            </Label>
            <Input
              id="company-filter"
              placeholder="Search companies..."
              value={filters.company}
              onChange={(e) => onFilterChange("company", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="role-type-filter" className="text-sm font-medium">
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
              onValueChange={(value) => onFilterChange("employmentType", value)}
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
              onValueChange={(value) => onFilterChange("remoteOption", value)}
              placeholder="Any work type"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="stage-filter" className="text-sm font-medium">
              Company Stage
            </Label>
            <MultiSelect
              options={COMPANY_STAGES.map((stage) => ({
                value: stage,
                label: stage,
              }))}
              value={filters.companyStage}
              onValueChange={(value) => onFilterChange("companyStage", value)}
              placeholder="Any stage"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category-filter" className="text-sm font-medium">
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

          <div>
            <Label htmlFor="country-filter" className="text-sm font-medium">
              Country
            </Label>
            <Input
              id="country-filter"
              placeholder="e.g., USA, GBR, CAN..."
              value={filters.country}
              onChange={(e) => onFilterChange("country", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="city-filter" className="text-sm font-medium">
              City
            </Label>
            <Input
              id="city-filter"
              placeholder="e.g., London, New York..."
              value={filters.city}
              onChange={(e) => onFilterChange("city", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="location-filter" className="text-sm font-medium">
              General Location
            </Label>
            <Input
              id="location-filter"
              placeholder="Search any location..."
              value={filters.location}
              onChange={(e) => onFilterChange("location", e.target.value)}
              className="mt-1"
            />
          </div>
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
                      const stringFields = [
                        "searchQuery",
                        "company",
                        "location",
                        "country",
                        "city",
                      ];
                      const arrayFields = [
                        "roleType",
                        "employmentType",
                        "remoteOption",
                        "companyStage",
                        "companyCategory",
                      ];

                      if (stringFields.includes(key)) {
                        onFilterChange(key as keyof JobFilters, "");
                      } else if (arrayFields.includes(key)) {
                        onFilterChange(key as keyof JobFilters, []);
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
