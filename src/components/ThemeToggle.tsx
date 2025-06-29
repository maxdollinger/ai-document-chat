"use client";

import { useEffect, useState } from "react";

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load stored or system preference on mount
  useEffect(() => {
    const stored = window.localStorage.getItem("theme") as
      | "light"
      | "dark"
      | null;
    const initial = stored ?? getSystemPreference();
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("theme", next);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-1 rounded-md hover:bg-muted transition-colors text-lg"
      aria-label="Toggle theme"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
} 