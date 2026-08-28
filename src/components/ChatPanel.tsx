"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import ChoiceCards from "@/components/ChoiceCards";
import type { PendingChoice } from "@/lib/knowledge/types";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatPanel({
  projectId,
  initialMessages,
  initialPrompt,
  initialPendingChoice,
}: {
  projectId: string;
  initialMessages: ChatMessage[];
  /**
   * The project's oneLinePurpose, set from the type picker on project creation.
   * Sent as the opening turn automatically so the developer isn't asked the same
   * question twice.
   */
  initialPrompt?: string;
  /**
   * A question the coach has presented as click-only options (via the present_choice
   * tool) that the developer hasn't picked yet. While this is set, the free-text input
   * is hidden — the wizard requires a click, not typed text.
   */
  initialPendingChoice?: PendingChoice | null;
}) {
  const autoStart = initialMessages.length === 0 && !!initialPrompt;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingChoice, setPendingChoice] = useState<PendingChoice | null>(
    initialPendingChoice ?? null
  );
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAutoSent = useRef(false);

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    setPendingChoice(null);
    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setSending(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: assistantText };
          return next;
        });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      // Tool calls made during the turn may have updated Requirements/Architecture/
      // Technology/Decisions — refresh so the sidebar progress ticks and other pages
      // reflect it next visit.
      router.refresh();

      // The streamed text above never carries tool results (e.g. a present_choice
      // call) — fetch the project's current pendingChoice separately to pick that up.
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (projectRes.ok) {
        const { project } = await projectRes.json();
        setPendingChoice(project.pendingChoice ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (autoStart && !hasAutoSent.current) {
      hasAutoSent.current = true;
      send(initialPrompt);
    }
    // Fires once, on mount, for a fresh project with a known starting prompt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-[60vh] flex-col rounded-lg border border-stone-200 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-lg bg-ink px-3 py-2 text-sm text-white">
              {m.content}
            </div>
          ) : (
            <div key={i} className="markdown-body max-w-[85%] rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-800">
              {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : sending ? "…" : ""}
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>
      {pendingChoice && (
        <ChoiceCards
          question={pendingChoice.question}
          options={pendingChoice.options}
          onSelect={(opt) => send(`I choose: ${opt.label}`)}
          disabled={sending}
        />
      )}
      {error && <p className="px-4 pb-2 text-sm text-red-600">{error}</p>}
      {!pendingChoice && (
        <div className="flex gap-2 border-t border-stone-200 p-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type your answer…"
            className="flex-1 rounded border border-stone-300 px-3 py-2 text-sm"
            disabled={sending}
          />
          <button
            onClick={() => send()}
            disabled={sending || !input.trim()}
            className="rounded bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
