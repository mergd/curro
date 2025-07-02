import { Card } from "@/components/ui/card";

export function JobPreviewSkeleton() {
  return (
    <Card className="p-6 border border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
          <div className="size-12 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded-full animate-pulse w-20" />
          <div className="h-6 bg-muted rounded-full animate-pulse w-16" />
        </div>

        {/* Salary */}
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </Card>
  );
}
