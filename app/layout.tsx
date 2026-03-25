import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Import komponen yang tadi dibuat
import AssistantBubble from "@/components/AssistantBubble"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Education App",
  description: "Belajar bareng AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children} {/* Ini konten halaman website kamu */}
        
        {/* 2. Taruh AssistantBubble di sini (di luar children) */}
        
        
      </body>
    </html>
  );
}