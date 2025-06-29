"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChatListingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-background text-foreground">
      <div className="w-full max-w-3xl text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Vorhandene Chats</h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Diese Seite wird bald Ihre bisherigen Chats auflisten.
        </p>

        <Button asChild>
          <Link href="/">Zurück zur Startseite</Link>
        </Button>
      </div>
    </main>
  );
} 