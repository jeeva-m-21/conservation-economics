"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, CheckCircle } from "lucide-react";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Register Service Worker in production / browser environment
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => console.warn("PWA SW registration failed:", err));
      });
    }

    // Network connectivity listeners
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {/* Offline Status Banner */}
      {isOffline && (
        <div
          role="status"
          aria-live="assertive"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-control bg-raised border border-border text-ink shadow-lg text-xs font-mono animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <WifiOff className="w-3.5 h-3.5 text-status-flag shrink-0" />
          <span>Offline mode active · Local storage &amp; quiz engine running</span>
        </div>
      )}

      {/* Back Online Toast */}
      {showReconnected && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-control bg-surface border border-data/30 text-ink shadow-lg text-xs font-mono animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle className="w-3.5 h-3.5 text-data shrink-0" />
          <span>Reconnected to network</span>
        </div>
      )}

      {children}
    </>
  );
}
