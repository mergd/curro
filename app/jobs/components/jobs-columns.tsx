import type { Doc } from "@/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyPreviewPopover } from "@/components/ui/company-preview-popover";

import { ExternalLinkIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import Link from "next/link";

type JobWithCompany = Doc<"jobs"> & {
  company: Doc<"companies"> | null;
};

export const jobsColumns: ColumnDef<JobWithCompany>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Job Title" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{job.title}</div>
          <div className="text-sm text-muted-foreground">
            {job.company ? (
              <div className="space-y-1">
                <CompanyPreviewPopover
                  companyId={job.company._id}
                  side="right"
                  align="start"
                >
                  <button
                    className="hover:text-foreground transition-colors text-left"
                    onClick={(e) => e.preventDefault()}
                  >
                    {job.company.name}
                  </button>
                </CompanyPreviewPopover>
              </div>
            ) : (
              "Unknown Company"
            )}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      const roleType = job.roleType;
      const employmentType = job.employmentType;
      const remoteOptions = job.remoteOptions;

      if (!roleType && !employmentType && !remoteOptions) return null;

      // Format role type
      const formattedRoleType = roleType
        ? roleType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : null;

      // Show employment type only if it's not permanent (since that's the default)
      const showEmploymentType =
        employmentType && employmentType !== "Permanent";
      const formattedEmploymentType = showEmploymentType
        ? employmentType === "Internship"
          ? "Internship"
          : employmentType
        : null;

      // Format remote options
      const formattedRemoteOptions =
        remoteOptions === "On-Site" ? "On-site" : remoteOptions;

      // Combine type information
      const typeParts = [
        formattedRoleType,
        formattedEmploymentType,
        formattedRemoteOptions,
      ].filter(Boolean);

      if (typeParts.length === 0) return null;

      return (
        <div className="flex flex-wrap gap-1">
          {formattedRoleType && (
            <Badge color="blue" className="text-xs">
              {formattedRoleType}
            </Badge>
          )}
          {formattedEmploymentType && (
            <Badge color="purple" className="text-xs">
              {formattedEmploymentType}
            </Badge>
          )}
          {formattedRemoteOptions && (
            <Badge
              color={
                remoteOptions === "Remote"
                  ? "green"
                  : remoteOptions === "Hybrid"
                    ? "yellow"
                    : "blue"
              }
              className="text-xs"
            >
              {formattedRemoteOptions}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "yearsOfExperience",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Experience" />
    ),
    cell: ({ row }) => {
      const experience = row.getValue("yearsOfExperience") as any;
      if (!experience) return "Not specified";

      if (experience.max) {
        return `${experience.min}-${experience.max} years`;
      }
      return `${experience.min}+ years`;
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: "locations",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const locations = row.getValue("locations") as string[] | undefined;
      if (!locations || locations.length === 0) return "Not specified";
      // truncate the location to not include the country code
      const truncatedLocations = locations.map((location) => {
        return location.split(",").slice(0, -1).join(", ");
      });

      return (
        <div className="space-y-1">
          <div>{truncatedLocations.slice(0, 2).join(", ")}</div>
          {truncatedLocations.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{truncatedLocations.length - 2} more
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "compensation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Salary" />
    ),
    cell: ({ row }) => {
      const compensation = row.getValue(
        "compensation",
      ) as JobWithCompany["compensation"];
      if (!compensation) return "Not specified";

      const { min, max, currency = "USD", type } = compensation;
      const symbol = currency === "USD" ? "$" : currency;
      const period = type === "annual" ? "/year" : "/hr";

      if (min && max) {
        return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()} ${period}`;
      } else if (min) {
        return `${symbol}${min.toLocaleString()}+ ${period}`;
      }
      return "Not specified";
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
      const date = new Date(timestamp);
      const now = Date.now();
      const diff = now - timestamp;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
      return date.toLocaleDateString();
    },
    meta: {
      variant: "dateRange",
      label: "Posted Date",
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="">
            <Link href={`/jobs/${job._id}`}>
              <EyeOpenIcon className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="">
            <Link href={job.url} target="_blank" rel="noopener noreferrer">
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
