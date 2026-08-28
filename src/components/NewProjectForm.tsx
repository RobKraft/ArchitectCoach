"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROJECT_TYPE_OPTIONS } from "@/lib/projectTypes";

export default function NewProjectForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function createProject(name: string, oneLinePurpose: string) {
    if (submitting) return;
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
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4">
      <h2 className="font-medium">Start a new project</h2>
      <p className="text-sm text-stone-600">What are you building?</p>
      <div className="flex flex-wrap gap-2">
        {PROJECT_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => createProject(opt.label, opt.message)}
            disabled={submitting}
            className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:border-ink hover:text-ink disabled:opacity-50"
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
