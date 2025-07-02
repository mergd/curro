"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { CompanyPreviewPopover } from "@/components/ui/company-preview-popover";
import { timeAgo } from "@/lib/formatters";

import { ExternalLinkIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export type CompanyWithJobCount = Doc<"companies"> & {
  jobCount: number;
};

export const companiesColumns: ColumnDef<CompanyWithJobCount>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => {
      const company = row.original;
      return (
        <CompanyPreviewPopover companyId={company._id}>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded-md transition-colors">
            <CompanyLogo
              logoUrl={company.logoUrl}
              companyName={company.name}
              size="md"
              className="flex-shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <div className="font-medium truncate">{company.name}</div>
              {company.description && (
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {company.description}
                </div>
              )}
            </div>
          </div>
        </CompanyPreviewPopover>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "stage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stage" />
    ),
    cell: ({ row }) => {
      const stage = row.getValue("stage") as string;
      if (!stage) return <span className="text-muted-foreground">—</span>;

      return (
        <Badge color="blue" className="text-xs">
          {stage}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Industry" />
    ),
    cell: ({ row }) => {
      const categories = row.getValue("category") as string[] | undefined;
      if (!categories || categories.length === 0)
        return <span className="text-muted-foreground">—</span>;

      return (
        <div className="flex flex-wrap gap-1">
          {categories.slice(0, 2).map((category) => (
            <Badge key={category} color="green" className="text-xs">
              {category}
            </Badge>
          ))}
          {categories.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{categories.length - 2}
            </span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const categories = row.getValue(id) as string[] | undefined;
      if (!categories) return false;
      return categories.some((category) => value.includes(category));
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "numberOfEmployees",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => {
      const size = row.getValue("numberOfEmployees") as string;
      if (!size) return <span className="text-muted-foreground">—</span>;

      return <span className="text-sm">{size}</span>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
      if (!locations || locations.length === 0)
        return <span className="text-muted-foreground">—</span>;

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
    accessorKey: "jobCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Open Jobs" />
    ),
    cell: ({ row }) => {
      const jobCount = row.getValue("jobCount") as number;
      return (
        <div className="text-center">
          <span className="font-medium">{jobCount}</span>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    accessorKey: "lastScraped",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const lastScraped = row.getValue("lastScraped") as number | undefined;
      if (!lastScraped)
        return <span className="text-xs text-muted-foreground">Never</span>;

      return <span className="text-xs">{timeAgo(lastScraped)}</span>;
    },
    enableSorting: true,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const company = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="size-8 p-0">
            <Link href={`/companies/${company._id}`}>
              <EyeOpenIcon className="size-4" />
              <span className="sr-only">View company</span>
            </Link>
          </Button>
          {company.website && (
            <Button asChild variant="ghost" size="sm" className="size-8 p-0">
              <Link
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="size-4" />
                <span className="sr-only">Visit website</span>
              </Link>
            </Button>
          )}
        </div>
      );
    },
  },
];
