import { Container, Item } from "@/components/motion";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export function CTASection() {
  return (
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
  );
}
