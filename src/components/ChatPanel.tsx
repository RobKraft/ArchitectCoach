"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

type ChatMessage = { role: "user" | "assistant"; content: string };

const OPENING_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Let's design this before we build it. I'll ask you questions, explain why they matter, and help you make the decisions — you can change your mind later. Tell me a bit about what you're building: what problem does it solve, and who's it for?",
};

export default function ChatPanel({
  projectId,
  initialMessages,
}: {
  projectId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.length ? initialMessages : [OPENING_MESSAGE]
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

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
      {error && <p className="px-4 pb-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 border-t border-stone-200 p-3">
        <input
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
          onClick={send}
          disabled={sending || !input.trim()}
          className="rounded bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
