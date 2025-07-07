"use client";

import { api } from "@/convex/_generated/api";

import { SpinnerGapIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useQuery } from "convex/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = useQuery(api.auth.isAdmin);

  if (isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <SpinnerIcon className="size-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Unauthorized</h1>
          <p className="text-muted-foreground">
            You do not have permission to access the admin area.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
