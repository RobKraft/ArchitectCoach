import type { AssessmentCatalog, OptionAssessment } from "./types";
import { STATIC_WEBSITE_ASSESSMENTS } from "./staticWebsite";
import { BLOG_ASSESSMENTS } from "./blog";
import { BACKEND_SITE_ASSESSMENTS } from "./backendSite";
import { PHONE_APP_ASSESSMENTS } from "./phoneApp";
import { DESKTOP_APP_ASSESSMENTS } from "./desktopApp";

export * from "./types";

/**
 * Every architecture/technology step's options, keyed by step id (step ids are globally
 * unique — they're prefixed by project type). Requirements steps ("who is it for", "main
 * goal") have no entry: cost, security, etc. don't apply to an audience choice.
 */
export const OPTION_ASSESSMENTS: AssessmentCatalog = {
  ...STATIC_WEBSITE_ASSESSMENTS,
  ...BLOG_ASSESSMENTS,
  ...BACKEND_SITE_ASSESSMENTS,
  ...PHONE_APP_ASSESSMENTS,
  ...DESKTOP_APP_ASSESSMENTS,
};

/** optionId → assessment for one step, or undefined when the step has none. */
export function getStepAssessments(stepId: string): Record<string, OptionAssessment> | undefined {
  return OPTION_ASSESSMENTS[stepId];
}
