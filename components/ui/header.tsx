"use client";

import { UserMenu } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

import { BriefcaseIcon } from "@phosphor-icons/react/dist/ssr";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface HeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export function Header({ onSearch, showSearch = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const navItems = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/jobs", label: "Jobs", icon: BriefcaseIcon },
    { href: "/dashboard", label: "Dashboard", icon: PersonIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`gap-2 transition-all duration-200 ${
                    isActive ? "shadow-md" : "hover:shadow-sm"
                  }`}
                >
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Search Bar - only show if requested */}
          {showSearch && (
            <div className="hidden lg:block flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="relative group">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                  type="search"
                  placeholder="Search jobs, companies, or roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/50 border-0 focus:bg-background transition-all duration-200 hover:bg-muted/70 focus:shadow-md"
                />
              </form>
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Toggle - only show if search is enabled */}
            {showSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-primary/10 transition-colors"
                onClick={() => {
                  // Could implement mobile search modal here
                }}
              >
                <MagnifyingGlassIcon className="size-4" />
              </Button>
            )}

            <UserMenu />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t bg-background/50">
          <nav className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`flex-col h-auto py-2 gap-1 ${
                    isActive ? "shadow-sm" : ""
                  }`}
                >
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
