"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] sm:max-h-[88vh] flex flex-col bg-surface border border-border rounded-card shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Pinned Modal Header */}
        <div className="shrink-0 p-5 pb-3.5 border-b border-rule flex items-start justify-between bg-surface">
          <div>
            {title && <h2 className="text-base sm:text-lg font-semibold text-ink">{title}</h2>}
            {description && (
              <p className="text-xs text-ink-muted mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-press p-1.5 rounded-control text-ink-muted hover:text-ink hover:bg-raised transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
