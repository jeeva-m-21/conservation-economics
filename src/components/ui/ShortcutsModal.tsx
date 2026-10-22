"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Keyboard } from "lucide-react";

export function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form controls
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const shortcuts = [
    {
      category: "Quiz & Questions",
      items: [
        { keys: ["1", "2", "3", "4"], description: "Select option 1 to 4" },
        { keys: ["←", "→"], description: "Previous / Next question" },
        { keys: ["Enter"], description: "Advance to next question / submit" },
        { keys: ["F"], description: "Toggle flag for review" },
        { keys: ["B"], description: "Bookmark / unbookmark question" },
      ],
    },
    {
      category: "General Navigation",
      items: [
        { keys: ["?"], description: "Open / close this shortcuts guide" },
        { keys: ["Esc"], description: "Close active modal or drawer" },
      ],
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-press hidden md:inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono text-ink-muted hover:text-ink bg-surface border border-border rounded-control transition-colors"
        title="Keyboard shortcuts (?)"
        aria-label="View keyboard shortcuts"
      >
        <Keyboard className="w-3.5 h-3.5" />
        <span className="text-[11px]">Shortcuts</span>
        <kbd className="px-1 py-0.2 bg-raised rounded border border-border text-[10px]">?</kbd>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Keyboard Navigation"
      >
        <div className="space-y-6">
          <p className="text-xs text-ink-secondary">
            Use these keyboard shortcuts to navigate questions and run quizzes rapidly without reaching for the mouse.
          </p>

          <div className="space-y-5">
            {shortcuts.map((group) => (
              <div key={group.category} className="space-y-2.5">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-ink-muted">
                  {group.category}
                </h4>
                <div className="divide-y divide-rule border border-border rounded-card bg-surface overflow-hidden">
                  {group.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                    >
                      <span className="text-ink">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k) => (
                          <kbd
                            key={k}
                            className="px-1.5 py-0.5 min-w-[20px] text-center font-mono text-[11px] font-medium bg-raised border border-border rounded text-ink shadow-[0_1px_0_rgba(0,0,0,0.06)]"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-rule flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="btn-press px-4 py-2 text-xs font-medium rounded-control bg-raised hover:bg-raised/80 text-ink border border-border transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
