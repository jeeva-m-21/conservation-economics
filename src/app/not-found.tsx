import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Compass, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 page-enter">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control bg-raised border border-border text-xs font-mono text-ink-muted">
          <span>404 · Page Not Found</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Lost in the syllabus?
        </h1>

        <p className="text-xs text-ink-muted leading-relaxed">
          The requested study module or question set could not be located. You can return to your dashboard or explore the practice question bank.
        </p>

        <div className="pt-2 flex items-center justify-center gap-2.5">
          <Link href="/">
            <Button variant="primary" size="md">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>

          <Link href="/practice">
            <Button variant="outline" size="md">
              <Compass className="w-3.5 h-3.5" />
              <span>Practice Questions</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
