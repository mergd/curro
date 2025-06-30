import type { Doc } from "@/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { formatSalary, timeAgo } from "@/lib/formatters";

import {
  ExternalLinkIcon,
  EyeOpenIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";

type BookmarkedJob = Doc<"jobs"> & {
  company: Doc<"companies"> | null;
};

export const bookmarksColumns: ColumnDef<BookmarkedJob>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Job Title" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="flex items-center gap-3">
          <CompanyLogo
            logoUrl={job.company?.logoUrl}
            companyName={job.company?.name || "Unknown Company"}
            size="sm"
          />
          <div className="space-y-1">
            <div className="font-medium">{job.title}</div>
            <div className="text-sm text-muted-foreground">
              {job.company?.name || "Unknown Company"}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "locations",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const locations = row.getValue("locations") as string[] | undefined;
      if (!locations || locations.length === 0) return "Not specified";

      return (
        <div className="space-y-1">
          <div>{locations.slice(0, 2).join(", ")}</div>
          {locations.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{locations.length - 2} more
            </div>
          )}
        </div>
      );
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "roleType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role Type" />
    ),
    cell: ({ row }) => {
      const roleType = row.getValue("roleType") as string;
      if (!roleType) return null;

      return (
        <Badge color="blue" className="text-xs">
          {roleType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "remoteOptions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Work Type" />
    ),
    cell: ({ row }) => {
      const remoteOptions = row.getValue("remoteOptions") as string;
      if (!remoteOptions) return null;

      const colorMap = {
        remote: "green",
        hybrid: "yellow",
        "on-site": "blue",
      } as const;

      return (
        <Badge
          color={colorMap[remoteOptions as keyof typeof colorMap] || "default"}
          className="text-xs"
        >
          {remoteOptions === "on-site"
            ? "On-site"
            : remoteOptions === "remote"
              ? "Remote"
              : "Hybrid"}
        </Badge>
      );
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "compensation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Salary" />
    ),
    cell: ({ row }) => {
      const compensation = row.getValue(
        "compensation",
      ) as BookmarkedJob["compensation"];
      return formatSalary(compensation) || "Not specified";
    },
    enableSorting: false,
  },
  {
    accessorKey: "_creationTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Posted" />
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue("_creationTime") as number;
      return timeAgo(timestamp);
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/jobs/${job._id}`}>
              <EyeOpenIcon className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={job.url} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              // Remove bookmark functionality will be handled by parent component
              const event = new CustomEvent("removeBookmark", {
                detail: { jobId: job._id },
              });
              window.dispatchEvent(event);
            }}
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];
