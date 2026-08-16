"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectForm() {
  const [name, setName] = useState("");
  const [oneLinePurpose, setOneLinePurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, oneLinePurpose }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { project } = await res.json();
      router.push(`/projects/${project.id}/interview`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-stone-200 bg-white p-4">
      <h2 className="font-medium">Start a new project</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
        className="w-full rounded border border-stone-300 px-3 py-2 text-sm"
        required
      />
      <input
        value={oneLinePurpose}
        onChange={(e) => setOneLinePurpose(e.target.value)}
        placeholder="One line: what are you building? (optional)"
        className="w-full rounded border border-stone-300 px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Start"}
      </button>
    </form>
  );
}
