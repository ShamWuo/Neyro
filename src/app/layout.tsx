import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for a clean, modern look
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@/components/analytics";
import { SimpleNav } from "@/components/simple-nav";
import { ToastContainer as Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Neyro",
  description: "PARA Productivity System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-[var(--bg)] font-sans text-[var(--text-primary)] antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <SimpleNav />
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
            <Analytics />
          </div>
        </Providers>
      </body>
    </html>
  );
}
