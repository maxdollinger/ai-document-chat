import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Ensure database and migrations are initialised on first server start
import "@/lib/db";

import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Document Chat",
  description: "Stellen Sie Fragen an Ihre hochgeladenen Dokumente und erhalten Sie KI-gestützte Antworten.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Site navigation */}
        <nav className="w-full border-b bg-background">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold text-lg">
              AI&nbsp;Document&nbsp;Chat
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/chat/new" className="hover:text-primary">
                Neuer Chat
              </Link>
              <Link href="/chat/listing" className="hover:text-primary">
                Vorhandene Chats
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
