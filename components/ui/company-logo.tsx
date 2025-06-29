import { cn } from "@/lib/utils";

import { BuildingIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

interface CompanyLogoProps {
  logoUrl?: string | null;
  companyName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-16",
  xl: "size-20",
};

const iconSizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-10",
};

export function CompanyLogo({
  logoUrl,
  companyName,
  size = "md",
  className,
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);

  const showFallback = !logoUrl || imageError;

  if (showFallback) {
    return (
      <div
        className={cn(
          "rounded-lg bg-muted flex items-center justify-center border",
          sizeClasses[size],
          className,
        )}
        title={companyName}
      >
        <BuildingIcon
          className={cn("text-muted-foreground", iconSizeClasses[size])}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden bg-muted border",
        sizeClasses[size],
        className,
      )}
    >
      <img
        src={logoUrl}
        alt={`${companyName} logo`}
        className="size-full object-contain p-2"
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
}
