"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { LogIn, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserButton() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.auth.currentUser);
  const router = useRouter();

  if (!user) {
    return (
      <Button onClick={() => router.push("/auth")}>
        <LogIn className="size-4" />
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="size-4" />
        <span className="text-sm">
          {user.name || user.email || "Anonymous"}
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={() => void signOut()}>
        <LogOut className="size-4" />
        Sign Out
      </Button>
    </div>
  );
}
