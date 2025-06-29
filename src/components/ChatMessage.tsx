"use client";

import { useEffect, useState, useId } from "react";
import {default as mermaid} from "mermaid";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
}

export default function ChatMessage({ content, role }: ChatMessageProps) {
  const [isDiagram, setIsDiagram] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);

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

  return (
    <div
      className={`p-3 rounded-lg w-full max-w-2xl overflow-x-auto ${baseClass}`}
    >
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
      {isDiagram && showDiagram ? 
      <pre className='mermaid'>{content}</pre>
      :
      content
      }
    </div>
  );
} 