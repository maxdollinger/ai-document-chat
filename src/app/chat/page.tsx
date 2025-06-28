"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const assistantId = searchParams.get("vectorStoreId");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

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
          vectorStoreId: assistantId,
          previousResponseId: lastResponseId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response from server");
      }

      console.log(res);

      const { response, responseId } = await res.json();
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMessage]);
      setLastResponseId(responseId);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
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
                <strong>Vectorstore ID:</strong> {assistantId}
              </p>
            </div>
            <div className="space-y-4 mb-4 h-96 overflow-y-auto p-4 border rounded-lg">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow p-2 border rounded-lg"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 