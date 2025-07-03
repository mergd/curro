"use client";

import { UserMenu } from "@/components/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";

import {
  BriefcaseIcon,
  BuildingIcon,
  ListIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { PersonIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/jobs", label: "Jobs", icon: BriefcaseIcon },
    { href: "/companies", label: "Companies", icon: BuildingIcon },
    { href: "/dashboard", label: "Dashboard", icon: PersonIcon },
  ];

  return (
    <header className="bg-white border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-4">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon
                  className={`size-4 ${isActive ? "text-white" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop User Menu */}
        <div className="hidden lg:flex">
          <UserMenu />
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <ListIcon className="size-6" />
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Dialog */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
            <Logo />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XIcon className="size-6" />
            </Button>
          </DialogHeader>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-gray-900 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon
                        className={`size-5 ${isActive ? "text-white" : ""}`}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <div className="py-6">
                <UserMenu />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
