"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const assistantId = searchParams.get("assistantId");
  const initialThreadId = searchParams.get("threadId");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [isLoading, setIsLoading] = useState(false);
  const [diagramMode, setDiagramMode] = useState(false);

  // Load existing messages if a thread ID is provided via query params
  useEffect(() => {
    const loadMessages = async () => {
      if (!initialThreadId) return;

      setIsLoading(true);
      try {
        const res = await fetch(`/api/chat?threadId=${initialThreadId}`);
        if (!res.ok) throw new Error("Failed to fetch thread messages");

        const { messages: existingMessages } = await res.json();
        setMessages(existingMessages);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
    // We intentionally want this to run only once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !assistantId) return;

    // Add user message locally
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          assistantId,
          threadId,
          diagramMode,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response from server");

      const { response, threadId: returnedThreadId } = await res.json();

      // Update threadId state and URL if new thread created
      if (!threadId && returnedThreadId) {
        setThreadId(returnedThreadId);
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set("threadId", returnedThreadId);
        router.replace(`?${params.toString()}`);
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, an error occurred." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="p-4 border rounded-lg mb-4">
              <p>
                <strong>Assistant ID:</strong> {assistantId}
              </p>
              <p>
                <strong>Thread ID:</strong> {threadId ?? "(new thread will be created)"}
              </p>
            </div>

            {/* Messages */}
            <div className="space-y-4 mb-4 h-96 overflow-y-auto p-4 border rounded-lg">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <ChatMessage content={msg.content} role={msg.role} />
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <label className="flex items-center gap-1 text-sm mr-2">
                <input
                  type="checkbox"
                  checked={diagramMode}
                  onChange={(e) => setDiagramMode(e.target.checked)}
                  disabled={isLoading}
                />
                Diagram
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow p-2 border rounded-lg"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !assistantId}>
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 