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

    // Dynamically import mermaid on the client to avoid SSR issues
    import("mermaid").then(async (m) => {

      const mermaid = m.default ?? m;

      // Initialize Mermaid once (safe to call multiple times)
      mermaid.initialize({ startOnLoad: false, theme: "default" });

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
  }, [chart, onError]);

  return <div ref={containerRef} className={className ?? "w-full"} />;
} 