"use client";

import { UserButton } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { BriefcaseIcon } from "@phosphor-icons/react/dist/ssr";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { motion } from "framer-motion";
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BriefcaseIcon className="size-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Curro
              </span>
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </nav>

          {/* Search Bar - only show if requested */}
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="hidden lg:block flex-1 max-w-md mx-6"
            >
              <form onSubmit={handleSearch} className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search jobs, companies, or roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/50 border-0 focus:bg-background transition-colors"
                />
              </form>
            </motion.div>
          )}

          {/* User Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {/* Mobile Search Toggle - only show if search is enabled */}
            {showSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => {
                  // Could implement mobile search modal here
                }}
              >
                <MagnifyingGlassIcon className="size-4" />
              </Button>
            )}

            <UserButton />
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t">
          <nav className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2 gap-1"
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
