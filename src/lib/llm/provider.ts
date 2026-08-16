import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * Provider-agnostic model selection. Which SDK gets called is controlled entirely
 * by LLM_PROVIDER — nothing else in the app imports @ai-sdk/anthropic or
 * @ai-sdk/openai directly, so switching providers never touches interview/plan logic.
 */
export function getLanguageModel(): LanguageModel {
  const provider = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase();

  if (provider === "openai") {
    const model = process.env.OPENAI_MODEL ?? "gpt-4.1";
    return openai(model);
  }

  if (provider === "anthropic") {
    const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
    return anthropic(model);
  }

  throw new Error(
    `Unknown LLM_PROVIDER "${provider}" — expected "anthropic" or "openai".`
  );
}
