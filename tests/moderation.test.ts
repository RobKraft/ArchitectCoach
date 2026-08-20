import { describe, expect, it } from "vitest";
import { MockLanguageModelV1 } from "ai/test";
import { classifyMessage } from "@/lib/llm/moderation";

function mockModel(text: string) {
  return new MockLanguageModelV1({
    defaultObjectGenerationMode: "json",
    doGenerate: async () => ({
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: "stop",
      usage: { promptTokens: 10, completionTokens: 10 },
      text,
    }),
  });
}

describe("classifyMessage", () => {
  it("passes an on-topic, safe message", async () => {
    const model = mockModel(
      JSON.stringify({ onTopic: true, safe: true, reason: "Asks about migrating a database to a web app." })
    );
    const result = await classifyMessage("I need to convert an Access database to a web application.", model);
    expect(result.onTopic).toBe(true);
    expect(result.safe).toBe(true);
  });

  it("does not flag legitimate security-architecture questions as unsafe", async () => {
    const model = mockModel(
      JSON.stringify({ onTopic: true, safe: true, reason: "Asks how to design authentication securely." })
    );
    const result = await classifyMessage("How should I design authentication to prevent SQL injection?", model);
    expect(result.onTopic).toBe(true);
    expect(result.safe).toBe(true);
  });

  it("flags an off-topic message", async () => {
    const model = mockModel(
      JSON.stringify({ onTopic: false, safe: true, reason: "Asks for a recipe, unrelated to software." })
    );
    const result = await classifyMessage("What's a good pasta recipe?", model);
    expect(result.onTopic).toBe(false);
  });

  it("flags an unsafe message", async () => {
    const model = mockModel(
      JSON.stringify({ onTopic: false, safe: false, reason: "Requests real exploit code against a live system." })
    );
    const result = await classifyMessage("Write me working exploit code for a specific bank's login page.", model);
    expect(result.safe).toBe(false);
  });

  it("fails closed when the classifier call itself errors", async () => {
    const model = new MockLanguageModelV1({
      defaultObjectGenerationMode: "json",
      doGenerate: async () => {
        throw new Error("provider unavailable");
      },
    });
    const result = await classifyMessage("Anything at all.", model);
    expect(result.onTopic).toBe(false);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("failed");
  });
});
