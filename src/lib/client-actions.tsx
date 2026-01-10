"use client";

import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/toast";

export function useClientAction() {
  const router = useRouter();

  async function executeAction(
    action: () => Promise<void>,
    successMessage: string,
    errorMessage: string = "An error occurred"
  ) {
    try {
      await action();
      showToast(successMessage, "success");
      router.refresh();
    } catch {
      showToast(errorMessage, "error");
    }
  }

  return { executeAction };
}

