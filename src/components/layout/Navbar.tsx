"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "../theme/ThemeToggle";
import {
  BookOpen,
  LayoutDashboard,
  Repeat,
  BarChart3,
  Bookmark,
  Settings,
  Menu,
  X,
  Compass,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: Compass },
  { href: "/revision", label: "Revision", icon: Repeat },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-ground/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-medium tracking-tight text-ink group"
        >
          <div className="w-7 h-7 rounded-badge bg-surface border border-border flex items-center justify-center text-data group-hover:border-data transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-ink">NPTEL Quiz</span>
            <span className="text-[10px] font-mono text-ink-muted leading-tight">Conservation Economics</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium transition-colors btn-press ${
                  isActive
                    ? "bg-surface text-ink border border-border shadow-sm"
                    : "text-ink-muted hover:text-ink hover:bg-raised"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-data" : "text-ink-muted"}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-control bg-surface border border-border text-ink"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-control text-sm font-medium ${
                  isActive
                    ? "bg-raised text-ink border border-border"
                    : "text-ink-muted hover:text-ink hover:bg-raised"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-data" : "text-ink-muted"}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
