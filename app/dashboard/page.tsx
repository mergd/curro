"use client";

import type { TabItem } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";

import {
  BookmarkIcon,
  DashboardIcon,
  FileTextIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Suspense, useMemo } from "react";

import { ApplicationsContent } from "./components/applications-content";
import { BookmarksContent } from "./components/bookmarks-content";
import { OverviewContent } from "./components/overview-content";
import { ProfileContent } from "./components/profile-content";

export default function DashboardPage() {
  const user = useQuery(api.auth.currentUser);
  const bookmarkStats = useQuery(api.bookmarks.getStats);
  const applicationStats = useQuery(api.applications.getStats);

  const tabItems: TabItem[] = useMemo(
    () => [
      {
        value: "overview",
        label: "Overview",
        icon: <DashboardIcon className="size-4" />,
      },
      {
        value: "bookmarks",
        label: "Bookmarks",
        icon: <BookmarkIcon className="size-4" />,
        badge: bookmarkStats
          ? {
              count: bookmarkStats.total,
              variant: "default",
            }
          : {
              loading: true,
            },
      },
      {
        value: "applications",
        label: "Applications",
        icon: <FileTextIcon className="size-4" />,
        badge: applicationStats
          ? {
              count: applicationStats.total,
              variant: "default",
            }
          : {
              loading: true,
            },
      },
      {
        value: "profile",
        label: "Profile",
        icon: <PersonIcon className="size-4" />,
      },
    ],
    [bookmarkStats, applicationStats],
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your dashboard
          </p>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList items={tabItems} />

          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Overview</h2>
              <p className="text-muted-foreground">
                Your job search activity and progress
              </p>
            </div>

            <Suspense fallback={<div>Loading overview...</div>}>
              <OverviewContent />
            </Suspense>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Saved Jobs</h2>
              <p className="text-muted-foreground">
                Jobs you&apos;ve bookmarked for later review
              </p>
            </div>

            <Suspense fallback={<div>Loading bookmarks...</div>}>
              <BookmarksContent />
            </Suspense>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Applications</h2>
              <p className="text-muted-foreground">
                Track your job applications and their status
              </p>
            </div>

            <Suspense fallback={<div>Loading applications...</div>}>
              <ApplicationsContent />
            </Suspense>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Profile</h2>
              <p className="text-muted-foreground">
                Manage your profile and job preferences
              </p>
            </div>

            <Suspense fallback={<div>Loading profile...</div>}>
              <ProfileContent />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
