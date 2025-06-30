"use client";

import type { Id } from "@/convex/_generated/dataModel";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";

import {
  ArrowClockwiseIcon,
  CheckCircleIcon,
  ClockIcon,
  LinkIcon,
  WarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Card, Flex, Text } from "@radix-ui/themes";
import { useAction, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface ErrorLogTableProps {
  company: any;
}

export function ErrorLogTable({ company }: ErrorLogTableProps) {
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [retryingJobs, setRetryingJobs] = useState<Set<string>>(new Set());

  const retryFailedJob = useAction(api.scraper.retryFailedJob);
  const retryAllFailedJobs = useAction(api.scraper.retryFailedJobsForCompany);
  const clearErrors = useAction(api.scraper.clearCompanyErrors);

  const failedJobs = useQuery(api.jobs.findFailedJobsByCompany, {
    companyId: company._id as Id<"companies">,
  });

  const errors = company.scrapingErrors || [];
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  const recentErrors = errors
    .filter((error: any) => error.timestamp > twentyFourHoursAgo)
    .sort((a: any, b: any) => b.timestamp - a.timestamp);

  const handleRetryJob = async (jobId: string) => {
    setRetryingJobs((prev) => new Set(prev).add(jobId));
    try {
      const result = await retryFailedJob({ jobId: jobId as Id<"jobs"> });
      if (result.success) {
        toast.success("Job retry scheduled successfully - will update shortly");
      } else {
        toast.error(`Failed to retry job: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to retry job");
    } finally {
      setRetryingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleRetryAllJobs = async () => {
    setIsRetryingAll(true);
    try {
      const result = await retryAllFailedJobs({
        companyId: company._id as Id<"companies">,
      });
      if (result.success) {
        toast.success(
          `Retry scheduled for ${result.retriedCount} failed jobs - will update shortly`,
        );
      } else {
        toast.error(`Failed to retry jobs: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to retry failed jobs");
    } finally {
      setIsRetryingAll(false);
    }
  };

  const handleClearErrors = async () => {
    setIsClearing(true);
    try {
      const result = await clearErrors({
        companyId: company._id as Id<"companies">,
      });
      if (result.success) {
        toast.success("Errors cleared and backoff reset");
      } else {
        toast.error(`Failed to clear errors: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to clear errors");
    } finally {
      setIsClearing(false);
    }
  };

  const hasErrors = recentErrors.length > 0;
  const hasFailedJobs = failedJobs && failedJobs.length > 0;
  const isHealthy = !hasErrors && !hasFailedJobs;

  if (isHealthy) {
    return (
      <Card className="p-6">
        <Flex
          align="center"
          justify="center"
          direction="column"
          gap="3"
          className="py-8"
        >
          <CheckCircleIcon className="size-12 text-green-600" />
          <Text size="4" weight="medium" className="text-green-600">
            Company is healthy
          </Text>
          <Text size="2" color="gray">
            No errors or failed jobs in the last 24 hours
          </Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <WarningIcon className="size-5 text-red-600" />
            <Text size="4" weight="medium">
              Issues Detected
            </Text>
          </Flex>

          <Flex gap="2">
            {hasErrors && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearErrors}
                disabled={isClearing}
                className="gap-1"
              >
                {isClearing ? (
                  <ArrowClockwiseIcon className="size-4 animate-spin" />
                ) : (
                  <XCircleIcon className="size-4" />
                )}
                Clear Errors
              </Button>
            )}

            {hasFailedJobs && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryAllJobs}
                disabled={isRetryingAll}
                className="gap-1"
              >
                {isRetryingAll ? (
                  <ArrowClockwiseIcon className="size-4 animate-spin" />
                ) : (
                  <ArrowClockwiseIcon className="size-4" />
                )}
                Retry All Failed Jobs
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Failed Jobs Section */}
        {hasFailedJobs && (
          <div className="space-y-3">
            <Flex align="center" gap="2">
              <ClockIcon className="size-4 text-orange-600" />
              <Text size="3" weight="medium">
                {failedJobs?.length} Failed Job
                {failedJobs?.length !== 1 ? "s" : ""}
              </Text>
            </Flex>

            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {failedJobs?.map((job) => (
                <div
                  key={job._id}
                  className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <Text size="2" weight="medium" className="truncate">
                      {job.title}
                    </Text>
                    <Flex align="center" gap="1" className="mt-1">
                      <LinkIcon className="size-3 text-gray-500" />
                      <Text size="1" color="gray" className="truncate">
                        {job.url}
                      </Text>
                    </Flex>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetryJob(job._id)}
                    disabled={retryingJobs.has(job._id)}
                    className="gap-1 ml-3 flex-shrink-0"
                  >
                    {retryingJobs.has(job._id) ? (
                      <ArrowClockwiseIcon className="size-3 animate-spin" />
                    ) : (
                      <ArrowClockwiseIcon className="size-3" />
                    )}
                    Retry
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Separator if both sections exist */}
        {hasErrors && hasFailedJobs && <Separator />}

        {/* Recent Errors Section */}
        {hasErrors && (
          <div className="space-y-3">
            <Flex align="center" gap="2">
              <WarningIcon className="size-4 text-red-600" />
              <Text size="3" weight="medium">
                {recentErrors.length} Error
                {recentErrors.length !== 1 ? "s" : ""} in Last 24 Hours
              </Text>
            </Flex>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {recentErrors.map((error: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <Flex align="start" justify="between">
                    <Flex align="center" gap="2">
                      <Badge
                        color={getErrorTypeColor(error.errorType)}
                        className="text-xs"
                      >
                        {formatErrorType(error.errorType)}
                      </Badge>
                      <Text size="2" color="gray">
                        {formatTimestamp(error.timestamp)}
                      </Text>
                    </Flex>
                  </Flex>

                  <Text size="2" className="leading-relaxed">
                    {error.errorMessage}
                  </Text>

                  {error.url && (
                    <Flex align="center" gap="1" className="pt-1">
                      <LinkIcon className="size-3 text-gray-500" />
                      <Text size="1" color="gray" className="break-all">
                        {error.url}
                      </Text>
                    </Flex>
                  )}
                </div>
              ))}
            </div>

            {recentErrors.length >= 10 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <Flex align="center" gap="2" className="text-red-800">
                  <WarningIcon className="size-4" />
                  <Text size="2" weight="medium">
                    Company marked as problematic due to high error count
                  </Text>
                </Flex>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function getErrorTypeColor(errorType: string): "red" | "orange" | "yellow" {
  switch (errorType.toLowerCase()) {
    case "fetch_failed":
    case "scraping_failed":
      return "red";
    case "parse_error":
    case "job_fetch_failed":
    case "job_details_failed":
      return "orange";
    case "rate_limited":
      return "yellow";
    default:
      return "red";
  }
}

function formatErrorType(errorType: string): string {
  return errorType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
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
