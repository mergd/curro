"use client";

import { Badge } from "@/components/ui/badge";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Card } from "@radix-ui/themes";

interface ErrorLogTableProps {
  company: any;
}

export function ErrorLogTable({ company }: ErrorLogTableProps) {
  const errors = company.scrapingErrors || [];
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  const recentErrors = errors
    .filter((error: any) => error.timestamp > twentyFourHoursAgo)
    .sort((a: any, b: any) => b.timestamp - a.timestamp);

  if (recentErrors.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-green-600 mb-2">
            ✓ No errors in the last 24 hours
          </div>
          <div className="text-sm">This company is currently healthy</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="size-5 text-red-600" />
          <h3 className="font-medium">
            {recentErrors.length} Error{recentErrors.length !== 1 ? "s" : ""} in
            Last 24 Hours
          </h3>
        </div>

        <div className="space-y-3">
          {recentErrors.map((error: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    color={getErrorTypeColor(error.errorType)}
                    className="text-xs"
                  >
                    {error.errorType.replace("_", " ").toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatTimestamp(error.timestamp)}
                  </span>
                </div>
              </div>

              <div className="text-sm">{error.errorMessage}</div>

              {error.url && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">URL:</span> {error.url}
                </div>
              )}
            </div>
          ))}
        </div>

        {recentErrors.length >= 10 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <ExclamationTriangleIcon className="size-4" />
              <span className="text-sm font-medium">
                Company marked as problematic due to high error count
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function getErrorTypeColor(errorType: string): "red" | "orange" | "yellow" {
  switch (errorType.toLowerCase()) {
    case "fetch_failed":
      return "red";
    case "parse_error":
      return "orange";
    case "rate_limited":
      return "yellow";
    default:
      return "red";
  }
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleString();
}
