"use client";

import { JobPreviewSkeleton, RecentJobs } from "@/app/jobs/components";
import { Container, Item } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { LogoCloud } from "@/components/ui/logo-cloud";

import { ArrowRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <Container className="max-w-4xl mx-auto text-center space-y-6">
          <Item>
            <div className="space-y-3 items-center flex flex-col">
              <Logo size="lg" className="mb-6" />
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight font-display leading-tight">
                Find Your Next Dream Job
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover opportunities at top companies. We aggregate the latest
                job openings from innovative startups and established tech
                companies.
                <br />
                <br />
                Get discovered by top companies, and track your applications.
              </p>
            </div>
          </Item>

          {/* Search Bar */}
          <Item>
            <div className="max-w-2xl mx-auto">
              <SearchBar />
            </div>
          </Item>

          {/* Stats */}
          <Item>
            <div className="flex justify-center gap-8">
              <StatsCard number="500+" label="Active Jobs" color="blue" />
              <StatsCard number="100+" label="Companies" color="purple" />
              <StatsCard number="24/7" label="Updates" color="green" />
            </div>
          </Item>
        </Container>
      </section>

      {/* Logo Cloud */}
      <section className="-mt-8">
        <Container>
          <Item>
            <LogoCloud />
          </Item>
        </Container>
      </section>

      {/* Recent Jobs Preview */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Container>
            <Item>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold font-display">
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

      {/* CTA Section */}
      <section className="py-16 px-4">
        <Container className="max-w-4xl mx-auto text-center space-y-6">
          <Item>
            <h2 className="text-2xl md:text-3xl font-bold font-display">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mt-2">
              Join thousands of professionals finding their perfect role
            </p>
          </Item>
          <Item>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="cursor-pointer">
                <Link href="/jobs">Browse All Jobs</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="cursor-pointer"
              >
                <Link href="/dashboard">Create Profile</Link>
              </Button>
            </div>
          </Item>
        </Container>
      </section>
    </div>
  );
}

function SearchBar() {
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
        className="pl-12 pr-24 py-5 text-lg rounded-full border-2 focus:border-primary focus-visible:ring-0"
      />
      <Button
        type="submit"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full cursor-pointer hover:scale-105 transition-transform duration-200"
      >
        Search
      </Button>
    </form>
  );
}

function StatsCard({
  number,
  label,
  color,
}: {
  number: string;
  label: string;
  color: "blue" | "purple" | "green";
}) {
  const colorClasses = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
  };

  return (
    <div>
      <div
        className={`text-2xl md:text-3xl font-bold ${colorClasses[color]} font-display`}
      >
        {number}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function JobPreviewGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <JobPreviewSkeleton key={i} />
      ))}
    </div>
  );
}
