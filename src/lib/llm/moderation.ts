/**
 * Pre-call gate run on every incoming interview chat message, before the (larger,
 * more expensive) coaching model or any tool ever runs. Two independent checks:
 * is this on-topic for software development/architecture, and is it safe (not a
 * request for real hacking/malware/exploit content, violence, or sexual content).
 * The interview system prompt (src/lib/llm/systemPrompt.ts) restates the same
 * policy as defense-in-depth, but this gate is the actual enforcement point —
 * it's what stops tokens being spent on the coaching model for messages that
 * should never reach it.
 */
import { generateObject, type LanguageModel } from "ai";
import { z } from "zod";
import { getGateModel } from "./provider";

const gateResultSchema = z.object({
  onTopic: z.boolean(),
  safe: z.boolean(),
  reason: z.string(),
});

export type GateResult = z.infer<typeof gateResultSchema>;

const GATE_SYSTEM_PROMPT = `You are a strict content gate for ArchitectCoach, a tool that helps
developers think through software architecture and design decisions before building.

Classify the user's message on two independent dimensions:

onTopic: true only if the message is about building software — requirements, architecture,
technology choices, scale/constraints, or a follow-up/clarification within that kind of
conversation. Legitimate security-architecture questions (e.g. "how do I prevent SQL injection",
"how should I design authentication", "what are the risks of storing tokens in localStorage") ARE
on-topic — do not flag a message just because it mentions security, hacking, injection, or attacks
in the context of designing a secure system. Casual conversation, general knowledge questions,
personal advice, or anything unrelated to software development is NOT on-topic.

safe: true unless the message asks for something that would cause real-world harm if answered
literally: working malware/exploit code intended to attack a real system, instructions for
violence, or sexual content. Discussing security concepts, vulnerability classes, or defensive
design (even in detail) is safe. Only mark unsafe when the request is for the harmful thing itself,
not when it merely discusses the topic academically or defensively.

reason: one short sentence explaining the classification, for an audit log — not shown to the
user verbatim in all cases, so it can be direct.`;

/**
 * Classifies a single incoming user message. Fail-closed: if the model call itself
 * throws (provider outage, network error), the message is treated as blocked rather
 * than silently let through — an outage in the gate very likely means the main
 * coaching call would fail too, since both hit the same provider.
 */
export async function classifyMessage(
  message: string,
  model: LanguageModel = getGateModel()
): Promise<GateResult> {
  try {
    const { object } = await generateObject({
      model,
      schema: gateResultSchema,
      system: GATE_SYSTEM_PROMPT,
      prompt: message,
    });
    return object;
  } catch {
    return {
      onTopic: false,
      safe: false,
      reason: "Moderation check failed (provider error) — blocked to fail closed.",
    };
  }
}
