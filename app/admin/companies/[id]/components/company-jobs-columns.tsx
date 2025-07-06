import type { Doc } from "@/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";

import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { DotsHorizontalIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { useAction } from "convex/react";
import Link from "next/link";
import { toast } from "sonner";

function ActionsCell({ row }: { row: any }) {
  const job = row.original;
  const refetchJob = useAction(api.scraper.refetchJob);

  const handleRefetch = async () => {
    toast.info(`Refetching job: ${job.title}`);
    const result = await refetchJob({ jobId: job._id });
    if (result.success) {
      toast.success("Job refetched successfully.");
    } else {
      toast.error(`Failed to refetch job: ${result.error}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link href={`/jobs/${job._id}`}>View Job</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={job.url} target="_blank" rel="noopener noreferrer">
            Visit Job URL
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRefetch}>
          <ArrowClockwiseIcon className="mr-2 size-4" />
          Refetch
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const companyJobsColumns: ColumnDef<Doc<"jobs">>[] = [
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
          {job.locations && job.locations.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {job.locations.slice(0, 2).join(", ")}
              {job.locations.length > 2 && ` +${job.locations.length - 2}`}
            </div>
          )}
        </div>
      );
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
      if (!roleType) return "Not specified";

      return (
        <Badge color="blue" className="text-xs">
          {roleType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "educationLevel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Education" />
    ),
    cell: ({ row }) => {
      const education = row.getValue("educationLevel") as string;
      if (!education) return "Not specified";

      return (
        <Badge color="gray" className="text-xs">
          {education.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
    },
    enableColumnFilter: true,
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
    accessorKey: "remoteOptions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remote" />
    ),
    cell: ({ row }) => {
      const remote = row.getValue("remoteOptions") as string;
      if (!remote) return "Not specified";

      const colorMap = {
        "on-site": "red",
        remote: "green",
        hybrid: "blue",
      } as const;

      return (
        <Badge
          color={colorMap[remote as keyof typeof colorMap] || "gray"}
          className="text-xs"
        >
          {remote.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "lastScraped",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Seen" />
    ),
    cell: ({ row }) => {
      const lastScraped = row.getValue("lastScraped") as number | undefined;
      if (!lastScraped) return "Unknown";

      const date = new Date(lastScraped);
      const now = Date.now();
      const diff = now - lastScraped;
      const hours = Math.floor(diff / (1000 * 60 * 60));

      if (hours < 1) return "Just now";
      if (hours < 24) return `${hours}h ago`;
      if (hours < 48) return "Yesterday";
      return date.toLocaleDateString();
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "actions",
    cell: ActionsCell,
    enableSorting: false,
    enableColumnFilter: false,
  },
];
