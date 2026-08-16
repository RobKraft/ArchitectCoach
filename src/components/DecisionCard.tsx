import type { DecisionRecord } from "@prisma/client";

export default function DecisionCard({ decision }: { decision: DecisionRecord }) {
  return (
    <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
      <div>
        <span className="rounded bg-stone-100 px-2 py-0.5 text-xs uppercase tracking-wide text-stone-500">
          {decision.section}
        </span>
        <p className="mt-2 font-medium">{decision.decision}</p>
      </div>

      <details open>
        <summary className="cursor-pointer text-sm font-medium text-stone-700">Why?</summary>
        <p className="mt-1 text-sm text-stone-600">{decision.rationale}</p>
      </details>

      {decision.alternatives && (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-stone-700">
            Alternatives considered
          </summary>
          <p className="mt-1 text-sm text-stone-600">{decision.alternatives}</p>
        </details>
      )}

      {decision.tradeoffs && (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-stone-700">Tradeoffs</summary>
          <p className="mt-1 text-sm text-stone-600">{decision.tradeoffs}</p>
        </details>
      )}

      {decision.consequences && (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-stone-700">
            Consequences
          </summary>
          <p className="mt-1 text-sm text-stone-600">{decision.consequences}</p>
        </details>
      )}

      {decision.learnMore.length > 0 && (
        <div>
          <p className="text-sm font-medium text-stone-700">Learn more</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-stone-600">
            {decision.learnMore.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
