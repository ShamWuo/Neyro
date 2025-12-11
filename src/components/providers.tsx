"use client";

import { SessionProvider } from "next-auth/react";
import { KeyboardShortcuts } from "./keyboard-shortcuts";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <KeyboardShortcuts />
      {children}
    </SessionProvider>
  );
}
