"use client";

import { useState } from "react";
import { showToast } from "./ui/toast";

type CSVExportProps = {
  data: Array<Record<string, unknown>>;
  filename?: string;
  fields?: string[];
  onExport?: () => void;
};

export function CSVExport({ data, filename = "export", fields, onExport }: CSVExportProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      showToast("No data to export", "warning");
      return;
    }

    setExporting(true);
    try {
      // Determine fields to export
      const exportFields = fields || (data.length > 0 ? Object.keys(data[0]) : []);

      if (exportFields.length === 0) {
        showToast("No fields to export", "warning");
        return;
      }

      // Create CSV header
      const headers = exportFields.map((field) => {
        // Escape header names
        const header = String(field);
        if (header.includes(",") || header.includes('"') || header.includes("\n")) {
          return `"${header.replace(/"/g, '""')}"`;
        }
        return header;
      }).join(",");

      // Create CSV rows
      const rows = data.map((item, index) => {
        try {
          return exportFields
            .map((field) => {
              const value = item[field];
              // Handle different value types
              if (value === null || value === undefined) return "";
              
              let stringValue: string;
              if (value instanceof Date) {
                stringValue = value.toISOString();
              } else if (typeof value === "object") {
                stringValue = JSON.stringify(value);
              } else {
                stringValue = String(value);
              }

              // Escape commas and quotes in CSV
              if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(",");
        } catch (error) {
          console.error(`Error processing row ${index}:`, error);
          return exportFields.map(() => "").join(",");
        }
      });

      // Combine header and rows with BOM for Excel compatibility
      const csvContent = "\uFEFF" + [headers, ...rows].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      link.setAttribute("aria-hidden", "true");
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      showToast("CSV exported successfully", "success");
      onExport?.();
    } catch (error) {
      console.error("CSV export error:", error);
      const message = error instanceof Error ? error.message : "Failed to export CSV";
      showToast(message, "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || !data || data.length === 0}
      className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-default)] hover:bg-[var(--card-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Export to CSV"
      aria-busy={exporting}
      type="button"
    >
      {exporting ? (
        <>
          <span className="inline-block animate-spin mr-2" aria-hidden="true">⏳</span>
          Exporting...
        </>
      ) : (
        "Export CSV"
      )}
    </button>
  );
}
