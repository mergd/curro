import type { Doc } from "@/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
            {job.company?.name || "Unknown Company"}
          </div>
        </div>
      );
    },
    meta: {
      label: "Job Title",
      variant: "text",
      placeholder: "Search jobs...",
    },
    enableSorting: true,
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
    meta: {
      variant: "select",
      options: [
        { label: "Software Engineering", value: "software-engineering" },
        { label: "Data Science", value: "data-science" },
        { label: "Product Management", value: "product-management" },
        { label: "Design", value: "design" },
        { label: "Marketing", value: "marketing" },
        { label: "Sales", value: "sales" },
        { label: "Operations", value: "operations" },
        { label: "Finance", value: "finance" },
        { label: "HR", value: "hr" },
        { label: "Legal", value: "legal" },
        { label: "Customer Success", value: "customer-success" },
        { label: "Business Development", value: "business-development" },
        { label: "General Apply", value: "general-apply" },
      ],
    },
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
    meta: {
      variant: "text",
      placeholder: "Search locations...",
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
    meta: {
      variant: "select",
      options: [
        { label: "Remote", value: "remote" },
        { label: "Hybrid", value: "hybrid" },
        { label: "On-site", value: "on-site" },
      ],
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "employmentType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const employmentType = row.getValue("employmentType") as string;
      if (!employmentType || employmentType === "permanent") return null;

      return (
        <Badge color="purple" className="text-xs">
          {employmentType === "internship" ? "Internship" : employmentType}
        </Badge>
      );
    },
    meta: {
      variant: "select",
      options: [
        { label: "Permanent", value: "permanent" },
        { label: "Contract", value: "contract" },
        { label: "Part-time", value: "part-time" },
        { label: "Temporary", value: "temporary" },
        { label: "Freelance", value: "freelance" },
        { label: "Internship", value: "internship" },
      ],
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
    enableColumnFilter: true,
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
