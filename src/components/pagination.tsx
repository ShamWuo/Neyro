"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1 || !Number.isFinite(totalPages) || totalPages < 1) return null;
  if (!Number.isFinite(currentPage) || currentPage < 1 || currentPage > totalPages) return null;

  const pages: number[] = [];
  const maxVisible = 5;
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    if (i >= 1 && i <= totalPages) {
      pages.push(i);
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => {
          const newPage = Math.max(1, currentPage - 1);
          onPageChange(newPage);
        }}
        disabled={currentPage <= 1}
        className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        ←
      </button>
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--border-strong)]"
          >
            1
          </button>
          {start > 2 && <span className="text-[var(--text-tertiary)]">...</span>}
        </>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
            page === currentPage
              ? "border-[var(--primary-strong)] bg-[var(--primary-strong)] text-white"
              : "border-[var(--border-subtle)] bg-[var(--card)] hover:border-[var(--border-strong)]"
          }`}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-[var(--text-tertiary)]">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--border-strong)]"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => {
          const newPage = Math.min(totalPages, currentPage + 1);
          onPageChange(newPage);
        }}
        disabled={currentPage >= totalPages}
        className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
}

