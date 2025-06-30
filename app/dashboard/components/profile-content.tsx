"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

import { useQuery } from "convex/react";
import Link from "next/link";

export function ProfileContent() {
  const userProfile = useQuery(api.userProfiles.get);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Profile Information</h3>
          <p className="text-sm text-muted-foreground">
            Manage your profile to get better job recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Years of Experience</label>
              <div className="text-lg">
                {userProfile?.yearsOfExperience || "Not specified"}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Interests</label>
              <div className="text-sm text-muted-foreground">
                {userProfile?.interests?.join(", ") || "Not specified"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Key Facts</label>
              <div className="space-y-1">
                {userProfile?.fourFacts?.map((fact, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {fact}
                  </div>
                )) || (
                  <div className="text-sm text-muted-foreground">
                    Not specified
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button asChild>
            <Link href="/dashboard/profile">Edit Profile</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
