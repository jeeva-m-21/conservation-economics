"use client";

import { useEffect, useState, useRef } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useProgressStore } from "@/store/useProgressStore";
import { defaultRepository } from "@/lib/storage/repository";
import { exportProgress, importProgress } from "@/lib/storage/backup";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

export default function SettingsPage() {
  const { settings, isLoaded, loadSettings, updateSettings } = useSettingsStore();
  const { clearAll, loadProgress } = useProgressStore();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleExport = async () => {
    try {
      const data = await exportProgress(defaultRepository);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nptel-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error:", e);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importProgress(text, defaultRepository);
      await loadProgress();
      await loadSettings();
      setImportStatus({
        type: "success",
        message: `Successfully imported ${result.importedAttempts} attempts and updated question stats!`,
      });
    } catch (err: any) {
      setImportStatus({
        type: "error",
        message: err.message || "Failed to import. Corrupted or invalid schema.",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmReset = async () => {
    await clearAll();
    await updateSettings({
      theme: "system",
      negativeMarking: false,
      shuffleOptions: true,
    });
    setResetModalOpen(false);
  };

  return (
    <main className="max-w-4xl mx-auto w-full px-4 py-8">
      <div className="border-b border-border pb-4 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Configure exam rules, display preferences, and local data backups.
        </p>
      </div>

      <div className="space-y-6">
        {/* Exam Simulation Rules */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-ink">Exam & Quiz Rules</h2>
            <p className="text-xs text-ink-muted">Set standard behavior for weekly assignments and mock exams.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-ink block">Negative Marking (-0.25)</label>
                <span className="text-xs text-ink-muted block">
                  Deducts 0.25 marks for incorrect answers. Unanswered questions receive 0.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.negativeMarking}
                onChange={(e) => updateSettings({ negativeMarking: e.target.checked })}
                className="w-4 h-4 rounded text-data focus:ring-data"
              />
            </div>

            <div className="border-t border-rule pt-4 flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-ink block">Shuffle Options</label>
                <span className="text-xs text-ink-muted block">
                  Randomizes the visual order of options A, B, C, D on each attempt.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.shuffleOptions}
                onChange={(e) => updateSettings({ shuffleOptions: e.target.checked })}
                className="w-4 h-4 rounded text-data focus:ring-data"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Portability (Zero-Database Export / Import) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">Data Portability & Backup</h2>
                <p className="text-xs text-ink-muted">
                  Your attempts and progress live exclusively on this device via IndexedDB.
                </p>
              </div>
              <Badge variant="data" size="sm">Local-First</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-card bg-raised/50 border border-border">
              <div>
                <h3 className="text-xs font-semibold text-ink">Export Progress File</h3>
                <p className="text-xs text-ink-muted">
                  Download a validated <code className="font-mono text-[11px]">nptel-progress.json</code> backup to transfer to another browser or device.
                </p>
              </div>
              <Button onClick={handleExport} variant="outline" size="sm" className="shrink-0">
                <Download className="w-3.5 h-3.5" />
                <span>Export Progress</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-card bg-raised/50 border border-border">
              <div>
                <h3 className="text-xs font-semibold text-ink">Restore from Backup</h3>
                <p className="text-xs text-ink-muted">
                  Upload a previously exported backup file to restore attempts and stats.
                </p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="import-backup-input"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Progress</span>
                </Button>
              </div>
            </div>

            {importStatus.type === "success" && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-control bg-status-correct-bg text-status-correct border border-status-correct/30">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}

            {importStatus.type === "error" && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-control bg-status-wrong-bg text-status-wrong border border-status-wrong/30">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-status-wrong/30">
          <CardHeader className="bg-status-wrong-bg/30">
            <h2 className="text-sm font-semibold text-status-wrong">Danger Zone</h2>
            <p className="text-xs text-ink-muted">Irreversible actions that clear your local test records.</p>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-ink">Reset All Progress & Attempts</h3>
              <p className="text-xs text-ink-muted">
                Permanently wipes all attempt logs and Leitner question stats stored in this browser.
              </p>
            </div>
            <Button
              onClick={() => setResetModalOpen(true)}
              variant="danger"
              size="sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Data</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Confirm Data Reset"
        description="Are you sure you want to delete all saved test attempts and study history?"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-control bg-status-wrong-bg text-status-wrong text-xs border border-status-wrong/30 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This will remove all attempt scores, bookmarks, and spaced repetition boxes from IndexedDB. This action cannot be undone.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReset}>
              Yes, Delete Everything
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
