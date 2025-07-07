"use client";

import type { TabItem } from "@/components/ui/tabs";
import type { Id } from "@/convex/_generated/dataModel";

import { JobEditForm } from "@/components/jobs/job-edit-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyLogo } from "@/components/ui/company-logo";
import { CompanyPreviewPopover } from "@/components/ui/company-preview-popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { formatSalary, timeAgo } from "@/lib/formatters";

import {
  ArrowLeftIcon,
  BookmarkFilledIcon,
  BookmarkIcon,
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GlobeIcon,
  InfoCircledIcon,
  Pencil1Icon,
  PersonIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { useAction, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { Suspense, use, useMemo, useState } from "react";
import { toast } from "sonner";

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const job = useQuery(api.jobs.get, { id: id as Id<"jobs"> });
  const user = useQuery(api.auth.currentUser);
  const isAdmin = useQuery(api.auth.isAdmin);
  const isBookmarked = useQuery(api.bookmarks.isBookmarked, {
    jobId: id as Id<"jobs">,
  });
  const addBookmark = useMutation(api.bookmarks.add);
  const removeBookmark = useMutation(api.bookmarks.remove);

  const refetchJob = useAction(api.scraper.refetchJob);

  const handleRefetch = async () => {
    const result = await refetchJob({ jobId: id as Id<"jobs"> });
    if (result.success) {
      toast.success("Job refetched successfully.");
    } else {
      toast.error(`Failed to refetch job: ${result.error}`);
    }
  };
  const [isEditing, setIsEditing] = useState(false);

  const hasEmbeddableATS = useMemo(() => {
    if (!job?.company?.sourceType) return false;
    return (
      job.company.sourceType === "greenhouse" ||
      job.company.sourceType === "ashby"
    );
  }, [job?.company?.sourceType]);

  const handleBookmarkToggle = async () => {
    if (!job) return;

    try {
      if (isBookmarked) {
        await removeBookmark({ jobId: job._id });
      } else {
        await addBookmark({ jobId: job._id });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const tabItems: TabItem[] = useMemo(() => {
    const items: TabItem[] = [
      {
        value: "overview",
        label: "Overview",
        icon: <FileTextIcon className="size-4" />,
      },
    ];

    if (hasEmbeddableATS && job?.company?.sourceType) {
      const atsName =
        job.company.sourceType === "greenhouse" ? "Greenhouse" : "Ashby";
      items.push({
        value: "apply",
        label: `Apply via ${atsName}`,
        icon: <CheckIcon className="size-4" />,
      });
    }

    // Track Application tab
    items.push({
      value: "track",
      label: "Track Application",
      icon: <PersonIcon className="size-4" />,
    });

    return items;
  }, [hasEmbeddableATS, job?.company?.sourceType, user]);

  if (!job) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <JobEditForm
            job={job}
            onCancel={() => setIsEditing(false)}
            onSave={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  function TrackApplicationContent({ jobId }: { jobId: string }) {
    const existingApplication = useQuery(api.applications.listByUser, {})?.find(
      (app) => app.jobId === jobId,
    );
    const addApplication = useMutation(api.applications.add);
    const updateApplication = useMutation(api.applications.update);

    const [status, setStatus] = useState(
      existingApplication?.status || "applied",
    );
    const [notes, setNotes] = useState(existingApplication?.notes || "");
    const [isSaving, setIsSaving] = useState(false);

    const applicationStatuses = [
      { value: "applied", label: "Applied" },
      { value: "screening", label: "Screening" },
      { value: "interviewing", label: "Interviewing" },
      { value: "offered", label: "Offered" },
      { value: "hired", label: "Hired" },
      { value: "rejected", label: "Rejected" },
      { value: "withdrawn", label: "Withdrawn" },
    ];

    const handleSave = async () => {
      setIsSaving(true);
      try {
        if (existingApplication) {
          await updateApplication({
            applicationId: existingApplication._id,
            status: status as any,
            notes: notes || undefined,
          });
        } else {
          await addApplication({
            jobId: jobId as any,
            status: status as any,
            appliedAt: Date.now(),
            notes: notes || undefined,
          });
        }
      } catch (error) {
        console.error("Error saving application:", error);
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Track Application Status
          </h2>
          <p className="text-muted-foreground">
            Update your application status and add notes to keep track of your
            progress.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Application Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue>
                  {applicationStatuses.find((s) => s.value === status)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {applicationStatuses.map((statusOption) => (
                  <SelectItem
                    key={statusOption.value}
                    value={statusOption.value}
                  >
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about your application, interview feedback, follow-up actions, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : existingApplication
                  ? "Update Application"
                  : "Save Application"}
            </Button>
            {existingApplication && (
              <Button variant="outline" asChild>
                <Link href="/dashboard?tab=applications">
                  View in Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>

        {existingApplication && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Applied:{" "}
                {existingApplication.appliedAt
                  ? new Date(existingApplication.appliedAt).toLocaleDateString()
                  : "Not specified"}
              </p>
              <p>
                Last Updated:{" "}
                {new Date(existingApplication.lastUpdated).toLocaleDateString()}
              </p>
              {existingApplication.applicationMethod && (
                <p>
                  Method:{" "}
                  {existingApplication.applicationMethod
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="">
            <Link href="/jobs">
              <ArrowLeftIcon className="size-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>

          {isAdmin && (
            <Button asChild variant="ghost" size="sm" className="">
              <Link href={`/admin`}>
                <Pencil1Icon className="size-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          )}
        </div>

        {/* Non-logged-in user banner */}
        {!user && (
          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <InfoCircledIcon className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">
                  Sign in to track your applications
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Create an account to bookmark jobs, track application status,
                  and manage your job search progress.
                </p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/auth">Sign In Now</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-8">
          <div className="space-y-6">
            {/* Job Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <h1 className="text-3xl font-bold">{job.title}</h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBookmarkToggle}
                    className="flex items-center gap-2"
                  >
                    {isBookmarked ? (
                      <BookmarkFilledIcon className="size-4" />
                    ) : (
                      <BookmarkIcon className="size-4" />
                    )}
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Pencil1Icon className="size-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefetch}
                        className="flex items-center gap-2"
                      >
                        <ReloadIcon className={`size-4 `} />
                        Refetch{" "}
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {job.company ? (
                    <CompanyPreviewPopover
                      companyId={job.company._id}
                      side="bottom"
                      align="start"
                    >
                      <button className="text-xl text-muted-foreground hover:text-foreground transition-colors text-left">
                        {job.company.name}
                      </button>
                    </CompanyPreviewPopover>
                  ) : (
                    <span className="text-xl text-muted-foreground">
                      Unknown Company
                    </span>
                  )}
                  {job.company?.website && (
                    <Link
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {job.company.website}
                    </Link>
                  )}
                </div>
              </div>
              {job.company ? (
                <CompanyPreviewPopover
                  companyId={job.company._id}
                  side="bottom"
                  align="end"
                >
                  <div>
                    <CompanyLogo
                      logoUrl={job.company?.logoUrl}
                      companyName={job.company?.name || "Unknown Company"}
                      size="lg"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </div>
                </CompanyPreviewPopover>
              ) : (
                <CompanyLogo
                  logoUrl={undefined}
                  companyName="Unknown Company"
                  size="lg"
                />
              )}
            </div>

            {/* Job Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {job.locations && job.locations.length > 0 && (
                <div className="flex items-center gap-2">
                  <GlobeIcon className="size-4" />
                  <span>{job.locations.join(", ")}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ClockIcon className="size-4" />
                <span>Posted {timeAgo(job._creationTime)}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {job.roleType && (
                <Badge color="blue">
                  {job.roleType
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              )}
              {job.remoteOptions && (
                <Badge color="green">
                  {job.remoteOptions === "on-site"
                    ? "On-site"
                    : job.remoteOptions === "remote"
                      ? "Remote"
                      : "Hybrid"}
                </Badge>
              )}
              {job.employmentType === "internship" && (
                <Badge color="purple">Internship</Badge>
              )}
              {job.yearsOfExperience && (
                <Badge color="yellow">
                  {job.yearsOfExperience.min}
                  {job.yearsOfExperience.max
                    ? `-${job.yearsOfExperience.max}`
                    : "+"}
                  {" years experience"}
                </Badge>
              )}
              {job.company?.sourceType &&
                job.company.sourceType !== "other" && (
                  <Badge color="gray">
                    {job.company.sourceType.charAt(0).toUpperCase() +
                      job.company.sourceType.slice(1)}{" "}
                    ATS
                  </Badge>
                )}
            </div>

            {/* Salary */}
            {formatSalary(job.compensation) && (
              <div className="text-lg font-semibold text-green-600">
                {formatSalary(job.compensation)}
              </div>
            )}

            {/* Tabs for Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList items={tabItems} />

              <TabsContent value="overview" className="space-y-6">
                {/* Description */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Job Description</h2>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {job.description}
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {job.parsedRequirements && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Requirements</h2>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {job.parsedRequirements}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {hasEmbeddableATS && job.company?.sourceType ? (
                <TabsContent value="apply" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">
                          Apply Directly
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Complete your application in the{" "}
                          {job.company.sourceType === "greenhouse"
                            ? "Greenhouse"
                            : "Ashby"}{" "}
                          interface below
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open in New Tab
                          <ExternalLinkIcon className="ml-2 size-4" />
                        </Link>
                      </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden bg-background">
                      <iframe
                        src={job.url}
                        className="w-full h-[800px] border-0"
                        title={`Apply for ${job.title} at ${job.company?.name}`}
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                      />
                    </div>
                  </div>
                </TabsContent>
              ) : (
                <TabsContent value="apply" className="space-y-4">
                  <div className="space-y-4">
                    <div className="text-center py-12">
                      <h2 className="text-xl font-semibold mb-2">
                        Apply to this position
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        This company&apos;s application system is not supported
                        for inline applications. Click the button below to apply
                        on their website.
                      </p>
                      <Button asChild size="lg">
                        <Link
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open in New Tab & Apply Now
                          <ExternalLinkIcon className="ml-2 size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="track" className="space-y-4">
                {user ? (
                  <Suspense fallback={<div>Loading...</div>}>
                    <TrackApplicationContent jobId={job._id} />
                  </Suspense>
                ) : (
                  <TooltipProvider>
                    <div className="space-y-4">
                      <div className="text-center py-12">
                        <PersonIcon className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2 text-muted-foreground">
                          Track Your Application
                        </h2>
                        <p className="text-muted-foreground mb-6">
                          Please sign in to track your job applications and
                          manage your job search progress.
                        </p>
                        <Button asChild>
                          <Link href="/auth">
                            Sign In to Track Applications
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </TooltipProvider>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
}
