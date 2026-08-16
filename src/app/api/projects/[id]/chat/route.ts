import { streamText, type CoreMessage } from "ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLanguageModel } from "@/lib/llm/provider";
import { INTERVIEW_SYSTEM_PROMPT } from "@/lib/llm/systemPrompt";
import { buildInterviewTools } from "@/lib/llm/interviewTools";
import { loadKnowledgeAndState, loadRecentHistory, summarizeKnowledge } from "@/lib/llm/context";

// Needs a long-lived Node runtime for streaming + Prisma; not deployable to the
// edge runtime as-is.
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  const body = await request.json().catch(() => ({}));
  const userMessage = typeof body?.message === "string" ? body.message.trim() : "";

  if (!userMessage) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await prisma.message.create({
    data: { projectId, role: "user", content: userMessage },
  });

  const { knowledge, interviewState } = await loadKnowledgeAndState(projectId);
  // Includes the message just saved above — this is the only place full history
  // would be needed, and even here it's capped (see MAX_HISTORY_MESSAGES).
  const history = await loadRecentHistory(projectId);

  const contextMessage: CoreMessage = {
    role: "user",
    content: `Current project state (read this, don't re-ask what's already answered):\n\n${summarizeKnowledge(
      knowledge,
      interviewState
    )}`,
  };

  const result = streamText({
    model: getLanguageModel(),
    system: INTERVIEW_SYSTEM_PROMPT,
    messages: [contextMessage, ...history],
    tools: buildInterviewTools(projectId),
    maxSteps: 5,
    onFinish: async ({ text }) => {
      if (text) {
        await prisma.message.create({
          data: { projectId, role: "assistant", content: text },
        });
      }
      await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() },
      });
    },
  });

  return result.toDataStreamResponse();
}
