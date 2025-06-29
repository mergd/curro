"use client";

import type { Id } from "@/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CompanyLogo } from "@/components/ui/company-logo";
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
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useAction } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

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
  backoffInfo?: {
    level: number;
    nextAllowedScrape: number;
    consecutiveFailures: number;
    lastSuccessfulScrape?: number;
    totalFailures: number;
  };
};

// Helper to determine if a company is problematic
const isProblematic = (company: Company) => {
  // Check backoff level
  if (company.backoffInfo?.level && company.backoffInfo.level >= 3) {
    return true;
  }

  // Check recent errors
  if (!company.scrapingErrors) return false;
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentErrors = company.scrapingErrors.filter(
    (e) => e.timestamp > oneDayAgo,
  );
  return recentErrors.length >= 10;
};

// Helper to get backoff status description
const getBackoffStatus = (company: Company) => {
  const backoffInfo = company.backoffInfo;
  if (!backoffInfo || backoffInfo.level === 0) {
    return "Normal";
  }

  const now = Date.now();
  if (backoffInfo.totalFailures >= 50) {
    return "Permanent";
  }

  if (now < backoffInfo.nextAllowedScrape) {
    const remainingMs = backoffInfo.nextAllowedScrape - now;
    const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

    if (remainingHours >= 2) {
      return `L${backoffInfo.level} (${remainingHours}h)`;
    } else {
      return `L${backoffInfo.level} (${remainingMinutes}m)`;
    }
  }

  return `L${backoffInfo.level} (Ready)`;
};

// Component for the actions cell to handle state
function CompanyActionsCell({ company }: { company: Company }) {
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const forceScrape = useAction(api.scraper.scrape);

  const handleForceScrape = async () => {
    setIsScrapingInProgress(true);
    try {
      const result = await forceScrape({
        companyId: company._id as Id<"companies">,
      });

      if (result.success) {
        toast.success(
          `Scraping initiated for ${company.name}. Jobs will be updated shortly.`,
        );
      } else if (result.error?.includes("skipped")) {
        toast.warning(`Scraping skipped for ${company.name}: ${result.error}`);
      } else {
        toast.error(
          `Failed to initiate scraping for ${company.name}: ${result.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error initiating scrape:", error);
      toast.error(
        `Failed to initiate scraping for ${company.name}. Please try again.`,
      );
    } finally {
      setIsScrapingInProgress(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="size-8 p-0 cursor-pointer">
          <span className="sr-only">Open menu</span>
          <DotsHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(company._id)}
          className="cursor-pointer"
        >
          Copy company ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleForceScrape}
          disabled={isScrapingInProgress}
          className="cursor-pointer"
        >
          <ArrowClockwiseIcon
            className={`size-4 mr-2 ${isScrapingInProgress ? "animate-spin" : ""}`}
          />
          {isScrapingInProgress ? "Scraping..." : "Force scrape jobs"}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          View details
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          Edit company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
          <CompanyLogo
            logoUrl={company.logoUrl}
            companyName={company.name}
            size="sm"
          />
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
    accessorKey: "backoffStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Backoff" />
    ),
    cell: ({ row }) => {
      const company = row.original;
      const status = getBackoffStatus(company);
      const level = company.backoffInfo?.level || 0;

      let variant: "default" | "red" | "green" | "blue" | "yellow" | "purple" =
        "default";
      if (status === "Permanent") {
        variant = "red";
      } else if (level >= 3) {
        variant = "red";
      } else if (level > 0) {
        variant = "yellow";
      }

      return (
        <Badge variant={variant} className="text-xs">
          {status}
        </Badge>
      );
    },
    sortingFn: (rowA, rowB) => {
      const levelA = rowA.original.backoffInfo?.level || 0;
      const levelB = rowB.original.backoffInfo?.level || 0;
      return levelA - levelB;
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
      return <CompanyActionsCell company={company} />;
    },
  },
];
