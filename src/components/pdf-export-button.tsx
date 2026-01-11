"use client";

import { useState } from "react";
import { showToast } from "./ui/toast";

type PDFExportButtonProps = {
  content: React.ReactNode;
  title: string;
  onExport?: () => void;
};

export function PDFExportButton({
  content,
  title,
  onExport,
}: PDFExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!title?.trim()) {
      showToast("Title is required for PDF export", "error");
      return;
    }

    setExporting(true);
    try {
      // For now, we'll use the browser's print to PDF functionality
      // In the future, this could use a server-side PDF generation library
      
      // Create a new window with the content
      const printWindow = window.open("", "_blank", "noopener,noreferrer");
      if (!printWindow) {
        // Pop-up blocker might be active
        showToast("Please allow pop-ups to export PDF, or use your browser's print function (Ctrl/Cmd+P)", "warning");
        return;
      }

      // Escape HTML in title to prevent XSS
      const escapedTitle = title
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      // Convert React node to string if needed
      let contentString = "";
      if (typeof content === "string") {
        contentString = content;
      } else {
        // For React nodes, we'll need to render them
        // For now, provide a placeholder
        contentString = "<p>Content preview - use browser print for full export</p>";
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${escapedTitle}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                padding: 40px;
                color: #0c1222;
                max-width: 800px;
                margin: 0 auto;
                line-height: 1.6;
              }
              h1 { font-size: 24px; font-weight: 600; margin-bottom: 20px; }
              h2 { font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; }
              h3 { font-size: 16px; font-weight: 600; margin-top: 20px; margin-bottom: 8px; }
              p { margin: 8px 0; }
              ul, ol { margin: 12px 0; padding-left: 24px; }
              li { margin: 4px 0; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: 600; }
              @media print {
                body { padding: 20px; }
                @page { margin: 1cm; size: A4; }
                @page :first { margin-top: 2cm; }
              }
              @media screen {
                @page { margin: 1cm; }
              }
            </style>
          </head>
          <body>
            <h1>${escapedTitle}</h1>
            ${contentString}
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
              Generated on ${new Date().toLocaleString()} from Neyro
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.addEventListener("load", () => {
        setTimeout(() => {
          printWindow.print();
          // Close after a delay to allow print dialog
          setTimeout(() => {
            printWindow.close();
          }, 1000);
          showToast("PDF export initiated - use Print to PDF in the dialog", "success");
          onExport?.();
        }, 500);
      });

      // Fallback if load event doesn't fire
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.print();
          setTimeout(() => printWindow.close(), 1000);
          showToast("PDF export initiated - use Print to PDF in the dialog", "success");
          onExport?.();
        }
      }, 1000);
    } catch (error) {
      console.error("PDF export error:", error);
      const message = error instanceof Error ? error.message : "Failed to export PDF";
      showToast(`${message}. Please use your browser's print function (Ctrl/Cmd+P).`, "error");
    } finally {
      // Don't set exporting to false immediately since print dialog is async
      setTimeout(() => {
        setExporting(false);
      }, 2000);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || !title?.trim()}
      className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-default)] hover:bg-[var(--card-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Export ${title} as PDF`}
      aria-busy={exporting}
      type="button"
    >
      {exporting ? (
        <>
          <span className="inline-block animate-spin mr-2" aria-hidden="true">⏳</span>
          Exporting...
        </>
      ) : (
        "Export PDF"
      )}
    </button>
  );
}
