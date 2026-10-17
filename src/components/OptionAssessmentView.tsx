import {
  ASSESSMENT_DIMENSIONS,
  ASSESSMENTS_AS_OF,
  type Level,
  type OptionAssessment,
} from "@/lib/wizard/assessments/types";

type Tone = "good" | "medium" | "bad";

const TONE_CLASSES: Record<Tone, string> = {
  good: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  bad: "bg-red-100 text-red-800",
};

/** Low complexity is good; high scalability is good — so the same Level maps to opposite tones. */
function levelTone(level: Level, higherIsBetter: boolean): Tone {
  if (level === "Medium") return "medium";
  return (level === "High") === higherIsBetter ? "good" : "bad";
}

export function Badge({ text, tone }: { text: string; tone: Tone }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {text}
    </span>
  );
}

export function ComplexityBadge({ level }: { level: Level }) {
  return <Badge text={`${level} complexity`} tone={levelTone(level, false)} />;
}

export function ScalabilityBadge({ level }: { level: Level }) {
  return <Badge text={`${level} scalability`} tone={levelTone(level, true)} />;
}

export function CostBadge({ bucket }: { bucket: OptionAssessment["cost"]["bucket"] }) {
  const tone: Tone = bucket === "Free" || bucket === "~$1/mo" ? "good" : bucket === "~$10/mo" ? "medium" : "bad";
  return <Badge text={bucket} tone={tone} />;
}

function dimensionBody(a: OptionAssessment, key: (typeof ASSESSMENT_DIMENSIONS)[number]["key"]) {
  switch (key) {
    case "deployment":
      return (
        <>
          <ComplexityBadge level={a.deployment.complexity} /> {a.deployment.notes}
        </>
      );
    case "components":
      return (
        <>
          {a.components.accounts.length > 0 ? (
            <ul className="mb-1 list-disc pl-5">
              {a.components.accounts.map((acct) => (
                <li key={acct}>{acct}</li>
              ))}
            </ul>
          ) : (
            <span className="font-medium">None. </span>
          )}
          {a.components.notes}
        </>
      );
    case "cost":
      return (
        <>
          <CostBadge bucket={a.cost.bucket} /> {a.cost.notes}
        </>
      );
    case "scalability":
      return (
        <>
          <ScalabilityBadge level={a.scalability.level} /> {a.scalability.notes}
        </>
      );
    default:
      return a[key];
  }
}

/** The full nine-question deep dive for one option, shown inside its choice card. */
export default function OptionAssessmentView({ assessment }: { assessment: OptionAssessment }) {
  return (
    <details className="text-sm text-stone-600">
      <summary className="cursor-pointer font-medium text-stone-700">Deep dive: cost, security, scale &amp; more</summary>
      <dl className="mt-2 space-y-2">
        {ASSESSMENT_DIMENSIONS.map(({ key, label }) => (
          <div key={key}>
            <dt className="font-medium text-stone-800">{label}</dt>
            <dd className="mt-0.5">{dimensionBody(assessment, key)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-stone-500">Costs are rough monthly ballparks as of {ASSESSMENTS_AS_OF}.</p>
    </details>
  );
}
