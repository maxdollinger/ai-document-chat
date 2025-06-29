"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import * as mermaid from "mermaid";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const assistantId = searchParams.get("assistantId");
  const initialThreadId = searchParams.get("threadId");
  const assistantName = searchParams.get("name") ?? "Dokumenten-Chat";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [isLoading, setIsLoading] = useState(false);
  const placeholderIndexRef = useRef<number | null>(null);

  // Load existing messages whenever threadId changes (including first mount)
  useEffect(() => {
    if (!threadId) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/chat?threadId=${threadId}`);
        if (!res.ok) throw new Error("Failed to fetch thread messages");

        const { messages: existingMessages } = await res.json();
        setMessages(existingMessages);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // initialize mermaid only once
    mermaid.default.initialize({ startOnLoad: false, theme: "default" });

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // Scroll to the very bottom whenever messages change
  useEffect(() => {
    // mermaid renders async to the DOM, so we need to wait for it to be rendered 
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 500);
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !assistantId) return;

    // Add user message locally
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => {
      const placeholder: Message = { role: "assistant", content: "__loading__" };
      const newMessages: Message[] = [...prev, userMessage, placeholder];
      placeholderIndexRef.current = newMessages.length - 1; // index of placeholder
      return newMessages;
    });
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

      // Replace placeholder with actual assistant message
      setMessages((prev) => {
        if (placeholderIndexRef.current === null) return prev;
        const newArr = [...prev];
        newArr[placeholderIndexRef.current] = { role: "assistant", content: response };
        return newArr;
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        if (placeholderIndexRef.current === null) return prev;
        const newArr = [...prev];
        newArr[placeholderIndexRef.current] = {
          role: "assistant",
          content: "Sorry, ein Fehler ist aufgetreten.",
        };
        return newArr;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-8 bg-background text-foreground">
      <div className="w-full max-w-5xl flex flex-col flex-1 mx-auto">
        <header className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {assistantName}
          </h1>
        </header>

            {/* Messages */}
            <div
              className="space-y-4 mb-4 flex-1 overflow-y-auto p-4 border rounded-lg"
            >
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
            <form onSubmit={handleSubmit} className="flex gap-2 items-center py-4 sticky bottom-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow p-2 border rounded-lg bg-background"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !assistantId}>
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </form>
      </div>
    </main>
  );
} 