"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "./pagination";

type InboxPaginationWrapperProps = {
  currentPage: number;
  totalPages: number;
};

export function InboxPaginationWrapper({ currentPage, totalPages }: InboxPaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (!Number.isFinite(page) || page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/inbox?${params.toString()}`);
  };

  if (totalPages <= 1 || !Number.isFinite(totalPages)) return null;

  return <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />;
}

