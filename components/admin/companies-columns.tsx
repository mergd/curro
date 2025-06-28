import type { ColumnDef } from "@tanstack/react-table";

import type { Doc } from "../../convex/_generated/dataModel";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  CheckIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";

export const companiesColumns: ColumnDef<Doc<"companies">>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => {
      const company = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{company.name}</div>
          {company.website && (
            <Link
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {company.website}
            </Link>
          )}
          {company.tags && company.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {company.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} color="blue" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {company.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{company.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      );
    },
    meta: {
      label: "Company Name",
      variant: "text",
      placeholder: "Search companies...",
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "sourceType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ATS Type" />
    ),
    cell: ({ row }) => {
      const sourceType = row.getValue("sourceType") as string;
      const colorMap = {
        ashby: "blue",
        greenhouse: "green",
        other: "gray",
      } as const;

      return (
        <Badge
          color={colorMap[sourceType as keyof typeof colorMap] || "gray"}
          className="text-xs"
        >
          {sourceType.charAt(0).toUpperCase() + sourceType.slice(1)}
        </Badge>
      );
    },
    meta: {
      variant: "select",
      options: [
        { label: "Ashby", value: "ashby" },
        { label: "Greenhouse", value: "greenhouse" },
        { label: "Other", value: "other" },
      ],
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "stage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stage" />
    ),
    cell: ({ row }) => {
      const stage = row.getValue("stage") as string;
      if (!stage) return null;

      return (
        <Badge color="purple" className="text-xs">
          {stage.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
    },
    meta: {
      variant: "select",
      options: [
        { label: "Pre-seed", value: "pre-seed" },
        { label: "Seed", value: "seed" },
        { label: "Series A", value: "series-a" },
        { label: "Series B", value: "series-b" },
        { label: "Series C", value: "series-c" },
        { label: "Series D", value: "series-d" },
        { label: "Series E", value: "series-e" },
        { label: "Growth", value: "growth" },
        { label: "Pre-IPO", value: "pre-ipo" },
        { label: "Public", value: "public" },
        { label: "Acquired", value: "acquired" },
      ],
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "locations",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Locations" />
    ),
    cell: ({ row }) => {
      const locations = row.getValue("locations") as string[] | undefined;
      if (!locations || locations.length === 0) return "Not specified";

      return (
        <div className="space-y-1">
          <div className="text-sm">{locations.slice(0, 2).join(", ")}</div>
          {locations.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{locations.length - 2} more
            </div>
          )}
        </div>
      );
    },
    enableColumnFilter: false,
  },
  {
    accessorKey: "lastScraped",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Scraped" />
    ),
    cell: ({ row }) => {
      const lastScraped = row.getValue("lastScraped") as number | undefined;
      if (!lastScraped) return "Never";

      const date = new Date(lastScraped);
      const now = Date.now();
      const diff = now - lastScraped;
      const hours = Math.floor(diff / (1000 * 60 * 60));

      if (hours < 1) return "Just now";
      if (hours < 24) return `${hours}h ago`;
      if (hours < 48) return "Yesterday";
      return date.toLocaleDateString();
    },
    meta: {
      variant: "dateRange",
      label: "Last Scraped",
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const company = row.original;
      const errors = company.scrapingErrors || [];
      const now = Date.now();
      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

      const recentErrors = errors.filter(
        (error) => error.timestamp > twentyFourHoursAgo,
      );
      const isProblematic = recentErrors.length >= 10;

      if (isProblematic) {
        return (
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="size-4 text-red-600" />
            <span className="text-sm text-red-600 font-medium">
              {recentErrors.length} errors
            </span>
          </div>
        );
      }

      if (recentErrors.length > 0) {
        return (
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="size-4 text-orange-600" />
            <span className="text-sm text-orange-600">
              {recentErrors.length} errors
            </span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <CheckIcon className="size-4 text-green-600" />
          <span className="text-sm text-green-600">Healthy</span>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const company = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <Pencil1Icon className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <TrashIcon className="size-4" />
          </Button>
          <Button asChild variant="ghost" size="sm" className="cursor-pointer">
            <Link
              href={company.jobBoardUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon className="size-4" />
            </Link>
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];
