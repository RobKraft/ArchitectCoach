"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChoiceCards, { type ChoiceCardOption } from "@/components/ChoiceCards";
import type { WizardStep } from "@/lib/wizard/catalog";

export default function WizardStepView({ projectId, step }: { projectId: string; step: WizardStep }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function choose(option: ChoiceCardOption) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/wizard/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId: step.id, optionId: option.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <p className="border-b border-stone-200 p-4 text-sm text-stone-600">{step.whyItMatters}</p>
      <ChoiceCards question={step.question} options={step.options} onSelect={choose} disabled={submitting} />
      {error && <p className="px-4 pb-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
