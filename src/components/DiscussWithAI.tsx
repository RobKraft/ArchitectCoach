"use client";

import { useEffect, useState } from "react";

const AI_DESTINATIONS = [
  { id: "chatgpt", label: "ChatGPT", url: "https://chatgpt.com/" },
  { id: "claude", label: "Claude.ai", url: "https://claude.ai/new" },
  { id: "gemini", label: "Gemini", url: "https://gemini.google.com/app" },
  { id: "copy", label: "Copy only (paste anywhere)", url: null },
] as const;

const STORAGE_KEY = "architectcoach-preferred-ai";

export default function DiscussWithAI({ prompt }: { prompt: string }) {
  const [destination, setDestination] = useState<string>("chatgpt");
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && AI_DESTINATIONS.some((d) => d.id === saved)) setDestination(saved);
    } catch {
      // localStorage unavailable (private browsing, etc.) — default stands.
    }
  }, []);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("copied");
    } catch {
      setStatus("error");
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, destination);
    } catch {
      // best-effort only
    }
    const dest = AI_DESTINATIONS.find((d) => d.id === destination);
    if (dest?.url) window.open(dest.url, "_blank", "noopener,noreferrer");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="rounded border border-stone-300 px-2 py-1.5 text-sm"
        aria-label="Preferred AI"
      >
        {AI_DESTINATIONS.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleClick}
        className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:border-ink hover:text-ink"
      >
        {status === "copied"
          ? "Copied — paste it in the new tab"
          : status === "error"
            ? "Couldn't copy — try again"
            : "Discuss this with my AI"}
      </button>
    </div>
  );
}
