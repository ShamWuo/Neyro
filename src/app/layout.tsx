import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PARA",
  description: "Opinionated PARA productivity app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-[#f8f9fa] text-[#111] antialiased`}> 
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
