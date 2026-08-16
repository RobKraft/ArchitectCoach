"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { DevelopmentPlan } from "@/lib/knowledge/types";

export default function PlanPanel({
  projectId,
  initialPlan,
}: {
  projectId: string;
  initialPlan: DevelopmentPlan;
}) {
  const [plan, setPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/plan`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPlan(data.developmentPlan);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={generate}
        disabled={loading}
        className="rounded bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? "Generating…" : plan.markdown ? "Regenerate plan" : "Generate plan"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {plan.markdown ? (
        <div className="markdown-body rounded-lg border border-stone-200 bg-white p-5">
          <ReactMarkdown>{plan.markdown}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-stone-500">
          No plan generated yet. This works best once requirements, architecture, and technology
          have some real content from the interview.
        </p>
      )}
      {plan.generatedAt && (
        <p className="text-xs text-stone-400">
          Last generated {new Date(plan.generatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
