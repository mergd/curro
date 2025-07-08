"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      // If empty search, just navigate to jobs page
      router.push("/jobs");
      return;
    }

    setIsSearching(true);

    // Navigate to jobs page with search query
    const searchParams = new URLSearchParams();
    searchParams.set("search", searchQuery.trim());
    router.push(`/jobs?${searchParams.toString()}`);

    // Reset searching state after a short delay to allow navigation
    setTimeout(() => {
      setIsSearching(false);
    }, 100);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search for jobs, companies, or roles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-12 pr-24 py-5 text-lg rounded-full border-2 focus:border-primary focus-visible:ring-0"
        disabled={isSearching}
      />
      <Button
        type="submit"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full cursor-pointer hover:scale-105 transition-transform duration-200"
        disabled={isSearching}
      >
        {isSearching ? (
          <div className="flex items-center gap-2">
            <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Searching...</span>
          </div>
        ) : (
          "Search"
        )}
      </Button>
    </form>
  );
}
