export default function HomePage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <header className="border-b border-border pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">NPTEL Course Portal</span>
            <h1 className="text-2xl font-semibold tracking-tight text-ink mt-1">Conservation Economics</h1>
          </div>
          <div className="text-xs font-mono px-2.5 py-1 rounded-badge bg-data-subtle text-data font-medium border border-data/20">
            12 Weeks · 120 Questions
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-card bg-surface border border-border">
          <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">Overall Readiness</div>
          <div className="text-3xl font-mono font-semibold text-ink mt-2 tabular">0%</div>
          <p className="text-xs text-ink-muted mt-1">Start practicing to build your score</p>
        </div>
        <div className="p-5 rounded-card bg-surface border border-border">
          <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">Questions Completed</div>
          <div className="text-3xl font-mono font-semibold text-ink mt-2 tabular">0 / 120</div>
          <p className="text-xs text-ink-muted mt-1">0% coverage across course</p>
        </div>
        <div className="p-5 rounded-card bg-surface border border-border">
          <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">Study Streak</div>
          <div className="text-3xl font-mono font-semibold text-ink mt-2 tabular">0 Days</div>
          <p className="text-xs text-ink-muted mt-1">Practice daily for retention</p>
        </div>
      </section>
    </main>
  );
}
