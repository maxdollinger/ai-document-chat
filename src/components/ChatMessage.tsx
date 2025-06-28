"use client";

import { useEffect, useState } from "react";
import Mermaid from "@/components/Mermaid";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  className?: string;
}

function looksLikeMermaid(src: string): boolean {
  const trimmed = src.trimStart();
  const keywords = [
    "graph",
    "flowchart",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "erDiagram",
    "gantt",
    "journey",
    "pie",
    "gitGraph",
    "xychart",
    "xychart-beta",
  ];
  return keywords.some((k) => trimmed.startsWith(k));
}

export default function ChatMessage({ content, role, className }: ChatMessageProps) {
  const [renderAsDiagram, setRenderAsDiagram] = useState(false);

  useEffect(() => {
    import("mermaid").then(async (m) => {
      const mermaid = m.default ?? m;
        const valid = await mermaid.parse(content, {suppressErrors: true});
        if (valid === true) {
          setRenderAsDiagram(true);
        } else {
          setRenderAsDiagram(false);
        }
    });
  }, [content]);

  const baseClass =
    role === "user" ? "bg-primary text-primary-foreground" : "bg-muted";

  return (
    <div className={`p-3 rounded-lg w-full overflow-x-auto ${baseClass} ${className ?? ""}`}>
      {renderAsDiagram ? (
        <Mermaid chart={content} className="w-full" onError={() => setRenderAsDiagram(false)} />
      ) : (
        content
      )}
    </div>
  );
} 