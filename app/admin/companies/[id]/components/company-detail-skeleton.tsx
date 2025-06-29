import { Skeleton } from "@/components/ui/skeleton";

import { Card } from "@radix-ui/themes";

export function CompanyDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="size-8 rounded" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-lg" />
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-28 rounded" />
              <Skeleton className="h-10 w-32 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Tabs Skeleton */}
          <div className="flex space-x-1 rounded-lg bg-muted p-1">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>

          {/* Overview Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Company Info Card */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-6 w-40 mb-4" />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categories and Tags */}
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-6 w-16 rounded-full" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-6 w-20 rounded-full" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-12 mb-2" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-6 w-14 rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Locations and Investors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <div className="space-y-1">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-4 w-32" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <div className="space-y-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-4 w-28" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-6">
              {/* Jobs Stats Card */}
              <Card className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-28" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-18" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Error Stats Card */}
              <Card className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-24" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="size-5" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
