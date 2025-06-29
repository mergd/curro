"use client";

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";

type Company = {
  _id: string;
  _creationTime: number;
  name: string;
  website?: string;
  logoUrl?: string;
  jobBoardUrl: string;
  sourceType: string;
  lastScraped?: number;
  numberOfEmployees?: string;
  stage?: string;
  category?: string[];
  subcategory?: string[];
  tags?: string[];
  locations?: string[];
  scrapingErrors?: Array<{
    timestamp: number;
    errorType: string;
    errorMessage: string;
    url?: string;
  }>;
};

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
      <DataTableColumnHeader column={column} title="ATS" />
    ),
    cell: ({ row }) => {
      const sourceType = row.getValue("sourceType") as string;
      return (
        <Badge variant="default">
          {sourceType.charAt(0).toUpperCase() + sourceType.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "numberOfEmployees",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => {
      const size = row.getValue("numberOfEmployees") as string;
      return size ? <span className="text-sm">{size}</span> : null;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "stage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stage" />
    ),
    cell: ({ row }) => {
      const stage = row.getValue("stage") as string;
      return stage ? (
        <Badge variant="default">
          {stage.charAt(0).toUpperCase() + stage.slice(1).replace(/-/g, " ")}
        </Badge>
      ) : null;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "lastScraped",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Scraped" />
    ),
    cell: ({ row }) => {
      const lastScraped = row.getValue("lastScraped") as number;
      return lastScraped ? (
        <span className="text-sm">
          {formatDistanceToNow(lastScraped, { addSuffix: true })}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">Never</span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const company = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(company._id)}
            >
              Copy company ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit company</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
