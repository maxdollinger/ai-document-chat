"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const assistantId = searchParams.get("assistantId");
  const threadId = searchParams.get("threadId");

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-background text-foreground">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            AI Document Chat
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-muted-foreground">
            Stellen Sie Ihre Fragen an die hochgeladenen Dokumente.
          </p>
        </header>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg">
              <p>
                <strong>Assistant ID:</strong> {assistantId}
              </p>
              <p>
                <strong>Thread ID:</strong> {threadId}
              </p>
            </div>
            {/* Chat interface will go here */}
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 