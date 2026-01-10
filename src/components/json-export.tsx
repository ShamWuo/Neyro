"use client";

import { useState } from "react";
import { showToast } from "./ui/toast";

type JSONExportProps = {
  data: unknown;
  filename?: string;
  onExport?: () => void;
};

export function JSONExport({ data, filename = "export", onExport }: JSONExportProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!data) {
      showToast("No data to export", "warning");
      return;
    }

    setExporting(true);
    try {
      // Handle circular references and special values
      const jsonString = JSON.stringify(data, (key, value) => {
        // Handle Date objects
        if (value instanceof Date) {
          return value.toISOString();
        }
        // Handle undefined (JSON.stringify omits these)
        if (value === undefined) {
          return null;
        }
        return value;
      }, 2);

      if (!jsonString || jsonString === "null") {
        showToast("No valid data to export", "warning");
        return;
      }

      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.json`);
      link.style.visibility = "hidden";
      link.setAttribute("aria-hidden", "true");
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      showToast("JSON exported successfully", "success");
      onExport?.();
    } catch (error) {
      console.error("JSON export error:", error);
      const message = error instanceof Error ? error.message : "Failed to export JSON";
      showToast(message, "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || !data}
      className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-default)] hover:bg-[var(--card-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Export to JSON"
      aria-busy={exporting}
      type="button"
    >
      {exporting ? (
        <>
          <span className="inline-block animate-spin mr-2" aria-hidden="true">⏳</span>
          Exporting...
        </>
      ) : (
        "Export JSON"
      )}
    </button>
  );
}
