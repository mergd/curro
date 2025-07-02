import type { Doc } from "@/convex/_generated/dataModel";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { timeAgo } from "@/lib/formatters";

import {
  CalendarIcon,
  ExternalLinkIcon,
  GlobeIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CompanyPreviewPopoverProps {
  companyId: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function CompanyPreviewPopover({
  companyId,
  children,
  side = "top",
  align = "center",
}: CompanyPreviewPopoverProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const company = useQuery(api.companies.get, { id: companyId as any });
  const jobs = useQuery(api.jobs.findActiveJobsByCompany, {
    companyId: companyId as any,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    router.push(`/companies/${companyId}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={handleClick}
          className="cursor-pointer"
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        side={side}
        align={align}
        sideOffset={8}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {!company ? (
          <CompanyPreviewSkeleton />
        ) : (
          <CompanyPreviewContent
            company={company}
            jobCount={jobs?.length || 0}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function CompanyPreviewSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

function CompanyPreviewContent({
  company,
  jobCount,
}: {
  company: Doc<"companies">;
  jobCount: number;
}) {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <CompanyLogo
            logoUrl={company.logoUrl}
            companyName={company.name}
            size="md"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate">
              {company.name}
            </h3>
            {company.stage && (
              <Badge color="blue" className="text-xs mt-1">
                {company.stage}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
            {company.description}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-3 space-y-2">
        <div className="grid grid-cols-2 gap-3 text-xs">
          {company.foundedYear && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">Founded {company.foundedYear}</span>
            </div>
          )}

          {company.numberOfEmployees && (
            <div className="flex items-center gap-2">
              <PersonIcon className="size-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{company.numberOfEmployees}</span>
            </div>
          )}

          {company.locations && company.locations.length > 0 && (
            <div className="flex items-center gap-2 col-span-2">
              <GlobeIcon className="size-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                {company.locations.slice(0, 2).join(", ")}
                {company.locations.length > 2 &&
                  ` +${company.locations.length - 2}`}
              </span>
            </div>
          )}
        </div>

        {/* Job Count */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Open positions</span>
            <span className="font-medium">{jobCount}</span>
          </div>
        </div>

        {/* Tags */}
        {(company.category || company.tags) && (
          <div className="pt-1">
            <div className="flex flex-wrap gap-1">
              {company.category?.slice(0, 2).map((cat) => (
                <Badge key={cat} color="green" className="text-xs">
                  {cat}
                </Badge>
              ))}
              {company.tags?.slice(0, 1).map((tag) => (
                <Badge key={tag} color="gray" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Financing */}
        {company.recentFinancing && (
          <div className="pt-1">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-green-600">
                ${company.recentFinancing.amount?.toLocaleString()}
              </span>{" "}
              raised{" "}
              {company.recentFinancing.date &&
                `in ${company.recentFinancing.date}`}
            </div>
          </div>
        )}

        {/* Last updated */}
        {company.lastScraped && (
          <div className="pt-1">
            <div className="text-xs text-muted-foreground">
              Updated {timeAgo(company.lastScraped)}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t bg-muted/30 p-3 flex gap-2">
        <Button asChild size="sm" className="flex-1 h-8 text-xs">
          <Link href={`/companies/${company._id}`}>View Company</Link>
        </Button>
        {company.website && (
          <Button asChild variant="outline" size="sm" className="h-8 px-3">
            <Link
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon className="size-3" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
