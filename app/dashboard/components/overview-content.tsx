"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

import { BookmarkIcon, DashboardIcon, PersonIcon } from "@radix-ui/react-icons";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Suspense } from "react";

import { RecentBookmarks } from "./recent-bookmarks";

export function OverviewContent() {
  const bookmarkStats = useQuery(api.bookmarks.getStats);
  const applicationStats = useQuery(api.applications.getStats);
  const userProfile = useQuery(api.userProfiles.get);

  if (!bookmarkStats || !applicationStats) {
    return <div>Loading...</div>;
  }

  const totalBookmarks = bookmarkStats.total;
  const totalApplications = applicationStats.total;
  const activeApplications = applicationStats.active;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">
              {totalBookmarks}
            </div>
            <div className="text-sm text-muted-foreground">Saved Jobs</div>
            <div className="text-xs text-muted-foreground">
              Jobs you&apos;ve bookmarked
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">
              {totalApplications}
            </div>
            <div className="text-sm text-muted-foreground">Applications</div>
            <div className="text-xs text-muted-foreground">
              Total applications submitted
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-orange-600">
              {activeApplications}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
            <div className="text-xs text-muted-foreground">
              Applications under review
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-purple-600">
              {userProfile?.yearsOfExperience || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Years Experience
            </div>
            <div className="text-xs text-muted-foreground">
              Based on your profile
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {totalBookmarks > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Bookmarks</h3>
            <p className="text-sm text-muted-foreground">
              Your most recently saved jobs
            </p>
            <Suspense fallback={<div>Loading recent bookmarks...</div>}>
              <RecentBookmarks />
            </Suspense>
          </div>
        </Card>
      )}
    </div>
  );
}
