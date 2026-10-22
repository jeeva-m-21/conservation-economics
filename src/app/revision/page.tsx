"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RevisionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/practice");
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-2">
        <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-ink-muted">Redirecting to Practice Mode...</p>
      </div>
    </div>
  );
}
