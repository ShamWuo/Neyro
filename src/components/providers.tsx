"use client";

import { SessionProvider } from "next-auth/react";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { ThemeProvider } from "./theme-provider";
import { ToastContainer } from "./ui/toast";
import { QuickCaptureModal } from "./quick-capture-modal";
import { PWAInstaller } from "./pwa-installer";
import { NativeInit } from "./native-init";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <NativeInit />
        <KeyboardShortcuts />
        <ToastContainer />
        <QuickCaptureModal />
        <PWAInstaller />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
