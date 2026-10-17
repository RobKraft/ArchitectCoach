import type { OptionAssessment } from "@/lib/wizard/assessments/types";
import { ComplexityBadge, CostBadge, ScalabilityBadge } from "@/components/OptionAssessmentView";

/** Side-by-side quick comparison of every option on one wizard step. */
export default function AssessmentCompareTable({
  options,
  assessments,
}: {
  options: { id: string; label: string }[];
  assessments: Record<string, OptionAssessment>;
}) {
  const rows = options.flatMap((opt) => {
    const a = assessments[opt.id];
    return a ? [{ opt, a }] : [];
  });
  if (rows.length === 0) return null;

  return (
    <details className="border-t border-stone-200 p-4 text-sm" open>
      <summary className="cursor-pointer font-medium text-stone-700">Compare options at a glance</summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
              <th className="py-2 pr-3 font-semibold">Option</th>
              <th className="py-2 pr-3 font-semibold">Deployment</th>
              <th className="py-2 pr-3 font-semibold">Accounts to manage</th>
              <th className="py-2 pr-3 font-semibold">Ballpark cost</th>
              <th className="py-2 font-semibold">Scalability</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ opt, a }) => (
              <tr key={opt.id} className="border-b border-stone-100 align-top">
                <td className="py-2 pr-3 font-medium text-stone-800">{opt.label}</td>
                <td className="py-2 pr-3">
                  <ComplexityBadge level={a.deployment.complexity} />
                </td>
                <td className="py-2 pr-3 text-stone-600" title={a.components.accounts.join(", ")}>
                  {a.components.accounts.length === 0 ? "None" : a.components.accounts.length}
                </td>
                <td className="py-2 pr-3">
                  <CostBadge bucket={a.cost.bucket} />
                </td>
                <td className="py-2">
                  <ScalabilityBadge level={a.scalability.level} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-stone-500">
        Open &ldquo;Deep dive&rdquo; on any option below for security, compliance, auditing, cost-monitoring, and
        performance details.
      </p>
    </details>
  );
}
