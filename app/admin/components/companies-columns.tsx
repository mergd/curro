"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DotsThree } from "@phosphor-icons/react/dist/ssr";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Company = Doc<"companies">;

// Helper to determine if a company is problematic
const isProblematic = (company: Company) => {
  if (!company.scrapingErrors) return false;
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentErrors = company.scrapingErrors.filter(
    (e) => e.timestamp > oneDayAgo,
  );
  return recentErrors.length >= 10;
};

export const columns: ColumnDef<Company>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => {
      const company = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src={company.logoUrl} alt={company.name} />
            <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{company.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const company = row.original;
      const problematic = isProblematic(company);
      return problematic ? (
        <Badge variant="red">Problematic</Badge>
      ) : (
        <Badge variant="default">OK</Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(isProblematic(row.original) ? "Problematic" : "OK");
    },
  },
  {
    accessorKey: "sourceType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      return <Badge variant="default">{row.original.sourceType}</Badge>;
    },
  },
  {
    accessorKey: "lastScraped",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Scraped" />
    ),
    cell: ({ row }) => {
      const lastScraped = row.original.lastScraped;
      if (!lastScraped) return "Never";
      return formatDistanceToNow(new Date(lastScraped), { addSuffix: true });
    },
  },
  {
    accessorKey: "jobBoardUrl",
    header: "Job Board",
    cell: ({ row }) => {
      return (
        <Link
          href={row.original.jobBoardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View
        </Link>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter();
      const company = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 p-0 data-[state=open]:bg-muted"
            >
              <DotsThree className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              onClick={() => router.push(`/admin/companies/${company._id}`)}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
