"use client";

import { JobPreviewSkeleton, RecentJobs } from "@/components/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ArrowRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Find Your Next{" "}
              <span className="bg-linear-to-r bg-clip-text text-transparent">
                Dream Job
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover opportunities at top companies. We aggregate the latest
              job openings from innovative startups and established tech
              companies.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-muted-foreground">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">100+</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-muted-foreground">Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Jobs Preview */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Latest Opportunities</h2>
              <p className="text-muted-foreground mt-2">
                Fresh job postings from top companies
              </p>
            </div>
            <Button asChild variant="outline" className="">
              <Link href="/jobs">
                View All Jobs
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <Suspense fallback={<JobPreviewGrid />}>
            <RecentJobs />
          </Suspense>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of professionals finding their perfect role
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="">
              <Link href="/jobs">Browse All Jobs</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="">
              <Link href="/dashboard">Create Profile</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SearchBar() {
  // TODO: Implement search functionality
  // When user searches, redirect to /jobs with search query
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Get search value and redirect to /jobs?search=query
    console.log("Search functionality to be implemented");
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search for jobs, companies, or roles..."
        className="pl-12 pr-24 py-6 text-lg rounded-full border-2"
      />
      <Button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full cursor-pointer"
      >
        Search
      </Button>
    </form>
  );
}

function JobPreviewGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <JobPreviewSkeleton key={i} />
      ))}
    </div>
  );
}
