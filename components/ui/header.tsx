"use client";

import { UserMenu } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

import { BriefcaseIcon } from "@phosphor-icons/react/dist/ssr";
import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/jobs", label: "Jobs", icon: BriefcaseIcon },
    { href: "/dashboard", label: "Dashboard", icon: PersonIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gray-900 text-white shadow-lg shadow-gray-900/25"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  <item.icon
                    className={`size-4 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center">
            <UserMenu />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <nav className="flex items-center justify-center gap-1 py-3 border-t bg-gray-50/50">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex flex-col items-center gap-1 px-6 py-2 rounded-lg text-xs font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gray-900 text-white shadow-md"
                        : "text-gray-500 hover:text-gray-900 hover:bg-white/70"
                    }
                  `}
                >
                  <item.icon
                    className={`size-5 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
