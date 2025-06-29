"use client";

import { useEffect, useState } from "react";
import {default as mermaid} from "mermaid";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
}

export default function ChatMessage({ content, role }: ChatMessageProps) {
  const [isDiagram, setIsDiagram] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
      mermaid.parse(content, { suppressErrors: true }).then((valid) => {
      if (valid === true) {
        setIsDiagram(true);
        setShowDiagram(true);
      } else {
        setIsDiagram(false);
        setShowDiagram(false);
      }
    });
  }, [content]);

  useEffect(() => {
    if(isDiagram && showDiagram) {
      mermaid.run();
    }
  }, [isDiagram, showDiagram]);

  const baseClass =
    role === "user" ? "bg-primary text-primary-foreground" : "bg-muted";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // Special case: loading placeholder
  if (content === "__loading__") {
    return (
      <div
        className={`p-3 rounded-lg w-full max-w-2xl overflow-x-auto bg-muted flex items-center`}
      >
        <span className="flex gap-1 text-3xl">
          <span className="animate-bounce [animation-delay:-0.2s]">.</span>
          <span className="animate-bounce [animation-delay:-0.1s]">.</span>
          <span className="animate-bounce">.</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative p-3 rounded-lg w-full max-w-2xl overflow-x-auto ${baseClass}`}
    >
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1 opacity-70 hover:opacity-100 transition rounded hover:bg-black/10"
        aria-label="Copy message"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-600" />
        ) : (
          <ClipboardIcon className="h-4 w-4" />
        )}
      </button>
      {isDiagram && (
        <>
          <label htmlFor="diagram-toggle" className="flex items-center gap-2 mb-2 text-sm">
            <input
              id="diagram-toggle"
              type="checkbox"
              checked={showDiagram}
              onChange={() =>
                setShowDiagram((prev) => !prev)
              }
            />
            Diagram anzeigen
          </label>
        </>
      )}
      {isDiagram && showDiagram ? (
        <pre className="mermaid">{content}</pre>
      ) : (
        content
      )}
    </div>
  );
} 