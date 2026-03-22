'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { SyncProvider } from '@/context/SyncProvider';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopbar } from '@/components/AppTopbar';
import { FloatingCaptureButton } from '@/components/FloatingCaptureButton';
import { QuickCaptureModal } from '@/components/QuickCaptureModal';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useGlobalShortcuts();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans bg-bg-primary text-text-primary">
        <AuthProvider>
          <SyncProvider>
            <div className="flex min-h-screen relative">
              <AppSidebar />
              <main className="flex-1 flex flex-col lg:pl-[224px] min-h-screen w-full">
                <AppTopbar />
                <div className="flex-1 p-6 w-full">
                  {children}
                </div>
              </main>
              <FloatingCaptureButton />
              <QuickCaptureModal />
            </div>
            <Toaster />
          </SyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
