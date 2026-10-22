"use client";

import React from "react";
import Link from "next/link";
import { Github, ExternalLink, ShieldCheck, Terminal, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface/60 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-rule">
          {/* Brand & Dev Attribution */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-ink">
                NPTEL Quiz Platform
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-badge bg-raised text-ink-muted border border-border">
                Static Edge
              </span>
            </div>
            <p className="text-xs text-ink-muted max-w-md">
              A zero-database, client-persisted study platform for 12 weeks of NPTEL Conservation Economics certification course material.
            </p>
          </div>

          {/* GitHub Developer Profile Callout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href="https://github.com/jeeva-m-21"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press group inline-flex items-center gap-2 px-3.5 py-2 rounded-control bg-raised hover:bg-raised/80 border border-border text-ink transition-colors text-xs font-medium"
            >
              <Github className="w-4 h-4 text-ink" />
              <span>Built by <strong className="font-semibold text-data">Jeeva</strong> (@jeeva-m-21)</span>
              <ExternalLink className="w-3 h-3 text-ink-muted group-hover:text-ink transition-colors" />
            </a>
          </div>
        </div>

        {/* Bottom Metadata & System Guarantees */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-ink-muted font-mono">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-data" />
              <span>100% Private (IndexedDB Local)</span>
            </span>
            <span>·</span>
            <span>Zero Server Latency</span>
            <span>·</span>
            <span>PWA Offline Ready</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/jeeva-m-21"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors underline underline-offset-2"
            >
              Explore Developer Portfolio
            </a>
            <span>·</span>
            <kbd className="px-1.5 py-0.5 bg-raised rounded border border-border text-[10px]">
              ? for shortcuts
            </kbd>
          </div>
        </div>
      </div>
    </footer>
  );
}
