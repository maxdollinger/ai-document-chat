"use client";

import { useEffect, useRef } from "react";

interface MermaidProps {
  chart: string;
  className?: string;
  onError?: () => void;
}

export default function Mermaid({ chart, className, onError }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string>(`mermaid-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    let isCancelled = false;

    // Dynamically import mermaid on the client to avoid SSR issues
    import("mermaid").then(async (m) => {
      if (isCancelled) return;

      const mermaid = m.default ?? m;

      // Initialize Mermaid once (safe to call multiple times)
      mermaid.initialize({ startOnLoad: false, theme: "default" });

      // 1. Validate syntax via mermaid.parse
       const valid = await mermaid.parse(chart);
       if (!valid) {
        if (onError) onError();
        return; // Invalid – bail out so parent can render plain text
       }

      // 2. Render since it parsed successfully
      mermaid
        .render(idRef.current, chart)
        .then(({ svg }: { svg: string }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch((err: unknown) => {
          /* eslint-disable no-console */
          console.error("Mermaid render error", err);
          if (onError) onError();
        });
    });

    return () => {
      isCancelled = true;
    };
  }, [chart, onError]);

  return <div ref={containerRef} className={className ?? "w-full"} />;
} 