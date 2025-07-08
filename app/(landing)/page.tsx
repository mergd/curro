"use client";

import { Container, Item } from "@/components/motion";
import { LogoCloud } from "@/components/ui/logo-cloud";

import {
  CTASection,
  HeroSection,
  HomeFooter,
  RecentJobsSection,
} from "./components";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <HeroSection />

      {/* Logo Cloud */}
      <section className="-mt-8">
        <Container>
          <Item>
            <LogoCloud />
          </Item>
        </Container>
      </section>

      {/* Recent Jobs Preview */}
      <RecentJobsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
