"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "../theme/ThemeToggle";
import { ShortcutsModal } from "../ui/ShortcutsModal";
import {
  LayoutDashboard,
  Repeat,
  BarChart3,
  Bookmark,
  Settings,
  Menu,
  X,
  Compass,
  Github,
  Globe,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: Compass },
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
        {/* Bespoke Geometric Brand Emblem */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-medium tracking-tight text-ink group select-none"
        >
          <div className="w-8 h-8 rounded-control bg-surface border border-border flex items-center justify-center text-data group-hover:border-data/60 transition-colors shadow-xs">
            <svg
              className="w-4 h-4 text-data"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M8 8h6" />
              <path d="M8 12h8" />
              <path d="M12 2v6" strokeWidth="1.5" className="opacity-40" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-ink">NPTEL Quiz</span>
            <span className="text-[10px] font-mono text-ink-muted leading-tight">Conservation Geography</span>
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
                    ? "bg-surface text-ink border border-border shadow-xs font-semibold"
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
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Portfolio Link */}
          <a
            href="https://www.jeeva.website/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-ink-muted hover:text-ink bg-surface border border-border hover:bg-raised rounded-control transition-colors"
            title="Visit Jeeva's Portfolio (jeeva.website)"
            aria-label="Jeeva's Portfolio"
          >
            <Globe className="w-3.5 h-3.5 text-data" />
            <span className="text-[11px]">jeeva.website</span>
          </a>

          {/* GitHub Profile Link */}
          <a
            href="https://github.com/jeeva-m-21"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-ink-muted hover:text-ink bg-surface border border-border hover:bg-raised rounded-control transition-colors"
            title="View Jeeva's GitHub Profile"
            aria-label="Jeeva's GitHub Profile"
          >
            <Github className="w-3.5 h-3.5 text-ink" />
            <span className="text-[11px]">@jeeva-m-21</span>
          </a>

          <ShortcutsModal />
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
        <div className="md:hidden border-b border-border bg-surface px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-control text-sm font-medium ${
                  isActive
                    ? "bg-raised text-ink border border-border font-semibold"
                    : "text-ink-muted hover:text-ink hover:bg-raised"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-data" : "text-ink-muted"}`} />
                <span>{label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-rule mt-2 space-y-1.5">
            <a
              href="https://www.jeeva.website/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-control text-xs font-mono text-ink bg-raised border border-border"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-data" />
                <span>Portfolio: jeeva.website</span>
              </div>
              <span className="text-data text-[10px]">↗</span>
            </a>

            <a
              href="https://github.com/jeeva-m-21"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-control text-xs font-mono text-ink bg-raised border border-border"
            >
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-ink" />
                <span>GitHub: @jeeva-m-21</span>
              </div>
              <span className="text-data text-[10px]">↗</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
