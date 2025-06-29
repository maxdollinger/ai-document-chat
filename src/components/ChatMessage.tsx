"use client";

import { useEffect, useState } from "react";
import {default as mermaid} from "mermaid";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      ) : isDiagram && !showDiagram ? (
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom styling for markdown elements
            h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="ml-2">{children}</li>,
            blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 dark:border-gray-600">{children}</blockquote>,
            code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
            pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto text-sm font-mono my-2">{children}</pre>,
            table: ({ children }) => <table className="border-collapse border border-gray-300 dark:border-gray-600 my-2">{children}</table>,
            th: ({ children }) => <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-800 font-semibold">{children}</th>,
            td: ({ children }) => <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{children}</td>,
          }}
        >
          {content}
        </ReactMarkdown>
      ) : role === "assistant" ? (
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom styling for markdown elements
            h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="ml-2">{children}</li>,
            blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 dark:border-gray-600">{children}</blockquote>,
            code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
            pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto text-sm font-mono my-2">{children}</pre>,
            table: ({ children }) => <table className="border-collapse border border-gray-300 dark:border-gray-600 my-2">{children}</table>,
            th: ({ children }) => <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-800 font-semibold">{children}</th>,
            td: ({ children }) => <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{children}</td>,
          }}
        >
          {content}
        </ReactMarkdown>
      ) : (
        content
      )}
    </div>
  );
} 