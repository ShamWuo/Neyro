import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@/components/analytics";
import dynamic from "next/dynamic";

// Load QuickCaptureButton dynamically to avoid adding client bundle to server layout
const QuickCaptureButton = dynamic(() => import("@/components/quick-capture-button"), { ssr: false });
const ActiveProjectsBadge = dynamic(() => import("@/components/active-projects-badge"), { ssr: false });
const QuickCaptureHint = dynamic(() => import("@/components/quick-capture-hint"), { ssr: false });

// Force light theme script - runs before React hydrates
const forceLightThemeScript = (
  <Script
    id="force-light-theme"
    strategy="beforeInteractive"
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          try {
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.style.colorScheme = 'light';
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('theme', 'light');
              localStorage.removeItem('theme-preference');
            }
          } catch (e) {}
        })();
      `,
    }}
  />
);

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Neyro – Instant Clarity for All Your Goals | PARA Productivity App",
    template: "%s | Neyro",
  },
  description: "Neyro is the productivity app that enforces what actually works. Built on PARA—a verified and efficient framework—Neyro helps you capture everything once, classify it instantly, and cut through the noise.",
  keywords: ["PARA", "productivity", "task management", "project management", "GTD", "productivity system", "second brain", "weekly review"],
  authors: [{ name: "Neyro" }],
  creator: "Neyro",
  publisher: "Neyro",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://neyro.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Neyro",
    title: "Neyro – Instant Clarity for All Your Goals | PARA Productivity App",
    description: "Neyro is the productivity app that enforces what actually works. Built on PARA—a verified and efficient framework—Neyro helps you capture everything once, classify it instantly, and cut through the noise.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Neyro – PARA Productivity App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neyro – Instant Clarity for All Your Goals | PARA Productivity App",
    description: "Neyro is the productivity app that enforces what actually works. Built on PARA—a verified and efficient framework—Neyro helps you capture everything once, classify it instantly, and cut through the noise.",
    images: ["/og-image.png"],
    creator: "@neyroapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Neyro",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" data-theme="light" style={{ colorScheme: "light" }}>
      <body className={`${inter.variable} bg-[var(--bg)] text-[var(--text-primary)] antialiased`}>
        {forceLightThemeScript}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <Providers>
          <div className="app-shell">
            <header className="app-header">
              <div className="header-inner">
                <div className="brand">Neyro</div>
                <div className="header-actions">
                  <ActiveProjectsBadge />
                  <QuickCaptureButton />
                  <QuickCaptureHint />
                </div>
              </div>
            </header>
            {children}
            <Analytics />
          </div>
        </Providers>
      </body>
    </html>
  );
}
