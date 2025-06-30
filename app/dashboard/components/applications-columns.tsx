import type { Doc } from "@/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { timeAgo } from "@/lib/formatters";

import {
  ExternalLinkIcon,
  EyeOpenIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import Link from "next/link";

type ApplicationWithDetails = Doc<"applications"> & {
  job: Doc<"jobs"> | null;
  company: Doc<"companies"> | null;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "applied":
      return "blue";
    case "screening":
      return "yellow";
    case "interviewing":
      return "purple";
    case "offered":
      return "green";
    case "hired":
      return "green";
    case "rejected":
      return "red";
    case "withdrawn":
      return "gray";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "applied":
      return "Applied";
    case "screening":
      return "Screening";
    case "interviewing":
      return "Interviewing";
    case "offered":
      return "Offered";
    case "hired":
      return "Hired";
    case "rejected":
      return "Rejected";
    case "withdrawn":
      return "Withdrawn";
    default:
      return status;
  }
};

export const applicationsColumns: ColumnDef<ApplicationWithDetails>[] = [
  {
    accessorKey: "job.title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Job" />
    ),
    cell: ({ row }) => {
      const application = row.original;
      const job = application.job;
      const company = application.company;

      if (!job) {
        return <span className="text-muted-foreground">Job not found</span>;
      }

      return (
        <div className="flex items-center gap-3">
          <CompanyLogo
            logoUrl={company?.logoUrl}
            companyName={company?.name || "Unknown Company"}
            size="sm"
          />
          <div className="space-y-1">
            <div className="font-medium">{job.title}</div>
            <div className="text-sm text-muted-foreground">
              {company?.name || "Unknown Company"}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge color={getStatusColor(status)} className="text-xs">
          {getStatusLabel(status)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "appliedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applied" />
    ),
    cell: ({ row }) => {
      const appliedAt = row.getValue("appliedAt") as number | undefined;
      if (!appliedAt) return "Not specified";
      return timeAgo(appliedAt);
    },
    enableSorting: true,
  },
  {
    accessorKey: "lastUpdated",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const lastUpdated = row.getValue("lastUpdated") as number;
      return timeAgo(lastUpdated);
    },
    enableSorting: true,
  },
  {
    accessorKey: "applicationMethod",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Method" />
    ),
    cell: ({ row }) => {
      const method = row.getValue("applicationMethod") as string | undefined;
      if (!method) return null;

      return (
        <Badge variant="default" className="text-xs">
          {method.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "interviewRounds",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Interviews" />
    ),
    cell: ({ row }) => {
      const rounds = row.getValue("interviewRounds") as any[] | undefined;
      if (!rounds || rounds.length === 0) return "None";

      return (
        <div className="text-sm">
          {rounds.length} round{rounds.length !== 1 ? "s" : ""}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const application = row.original;
      const job = application.job;

      return (
        <div className="flex items-center gap-2">
          {job && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/jobs/${job._id}`}>
                <EyeOpenIcon className="size-4" />
              </Link>
            </Button>
          )}
          {job && (
            <Button asChild variant="ghost" size="sm">
              <Link href={job.url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="size-4" />
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Edit application functionality
              console.log("Edit application:", application._id);
            }}
          >
            <Pencil1Icon className="size-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];
