"use client";

import { PullToRefresh } from "./pull-to-refresh";
import { useRouter } from "next/navigation";

type InboxWithRefreshProps = {
  children: React.ReactNode;
};

export function InboxWithRefresh({ children }: InboxWithRefreshProps) {
  const router = useRouter();

  const handleRefresh = async () => {
    // Trigger a router refresh to refetch server data
    router.refresh();
    // Small delay to ensure the refresh indicator is visible
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
      {children}
    </PullToRefresh>
  );
}

