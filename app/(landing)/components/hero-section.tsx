import { Container, Item } from "@/components/motion";
import { Logo } from "@/components/ui/logo";

import { SearchBar } from "./search-bar";
import { StatsCard } from "./stats-card";

export function HeroSection() {
  return (
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
            <StatsCard number="20+" label="Companies" color="purple" />
            <StatsCard number="24/7" label="Updates" color="green" />
          </div>
        </Item>
      </Container>
    </section>
  );
}
