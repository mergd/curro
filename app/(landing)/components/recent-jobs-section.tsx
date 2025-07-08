import { JobPreviewSkeleton, RecentJobs } from "@/app/jobs/components";
import { Container, Item } from "@/components/motion";
import { Button } from "@/components/ui/button";

import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Suspense } from "react";

function JobPreviewGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <JobPreviewSkeleton key={i} />
      ))}
    </div>
  );
}

export function RecentJobsSection() {
  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <Container>
          <Item>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold font-display">
                  Latest Opportunities
                </h2>
                <p className="text-muted-foreground mt-1">
                  Fresh job postings from top companies
                </p>
              </div>
              <Button asChild variant="outline" className="cursor-pointer">
                <Link href="/jobs">
                  View All Jobs
                  <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </Item>

          <Item>
            <Suspense fallback={<JobPreviewGrid />}>
              <RecentJobs />
            </Suspense>
          </Item>
        </Container>
      </div>
    </section>
  );
}
