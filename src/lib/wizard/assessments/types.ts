/**
 * Pre-written, per-option answers to the questions an architect should ask about every
 * tradeoff (deployment effort, accounts to manage, cost, security, scale, GRC, auditing,
 * cost monitoring, performance). Hand-authored ahead of time so the deployed site never
 * needs an AI call to answer them — see docs/decisions/0007-precomputed-option-assessments.md.
 */

/** Ballpark monthly cost at small-project scale. Deliberately coarse — a bucket, not a quote. */
export const COST_BUCKETS = ["Free", "~$1/mo", "~$10/mo", "~$50/mo", "~$100/mo", "$100+/mo"] as const;
export type CostBucket = (typeof COST_BUCKETS)[number];

export type Level = "Low" | "Medium" | "High";

/** When the cost buckets were last checked against real vendor pricing. */
export const ASSESSMENTS_AS_OF = "October 2026";

export type OptionAssessment = {
  /** How complicated is deploying (and redeploying) this option? */
  deployment: { complexity: Level; notes: string };
  /** Which separate accounts/services/integrations someone has to own and manage. */
  components: { accounts: string[]; notes: string };
  /** Ballpark cost, plus what makes it grow. */
  cost: { bucket: CostBucket; notes: string };
  /** Security concerns this option introduces or removes. */
  security: string;
  /** How far this option scales before it needs rework. */
  scalability: { level: Level; notes: string };
  /** Governance, risk, and compliance concerns (privacy law, vendor terms, licensing, policy). */
  grc: string;
  /** How to check that it's actually working correctly. */
  auditing: string;
  /** How to keep the bill from surprising you. */
  costMonitoring: string;
  /** What performance to expect. */
  performance: string;
};

/** stepId → optionId → assessment. */
export type AssessmentCatalog = Record<string, Record<string, OptionAssessment>>;

/** Display order and labels for the nine dimensions. */
export const ASSESSMENT_DIMENSIONS = [
  { key: "deployment", label: "Deployment complexity" },
  { key: "components", label: "Accounts & integrations to manage" },
  { key: "cost", label: "Ballpark cost" },
  { key: "security", label: "Security concerns" },
  { key: "scalability", label: "Scalability" },
  { key: "grc", label: "Governance, risk & compliance" },
  { key: "auditing", label: "Auditing for correctness" },
  { key: "costMonitoring", label: "Staying on top of costs" },
  { key: "performance", label: "Performance" },
] as const satisfies readonly { key: keyof OptionAssessment; label: string }[];
