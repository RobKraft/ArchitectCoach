import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

function currentProvider(): "openai" | "anthropic" {
  const provider = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase();
  if (provider === "openai" || provider === "anthropic") {
    return provider;
  }
  throw new Error(
    `Unknown LLM_PROVIDER "${provider}" — expected "anthropic" or "openai".`
  );
}

/**
 * Provider-agnostic model selection. Which SDK gets called is controlled entirely
 * by LLM_PROVIDER — nothing else in the app imports @ai-sdk/anthropic or
 * @ai-sdk/openai directly, so switching providers never touches interview/plan logic.
 */
export function getLanguageModel(): LanguageModel {
  if (currentProvider() === "openai") {
    return openai(process.env.OPENAI_MODEL ?? "gpt-4.1");
  }
  return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5");
}

/**
 * A small, fast model for the pre-call moderation gate (src/lib/llm/moderation.ts)
 * — deliberately separate from ANTHROPIC_MODEL/OPENAI_MODEL so the gate stays cheap
 * even if the coaching model is upgraded to something larger.
 */
export function getGateModel(): LanguageModel {
  if (currentProvider() === "openai") {
    return openai(process.env.OPENAI_GATE_MODEL ?? "gpt-4o-mini");
  }
  return anthropic(process.env.ANTHROPIC_GATE_MODEL ?? "claude-haiku-4-5");
}
