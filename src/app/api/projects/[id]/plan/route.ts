import { generateText } from "ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLanguageModel } from "@/lib/llm/provider";
import { parseProjectKnowledge } from "@/lib/knowledge/types";
import { buildPlanPrompt } from "@/lib/llm/planPrompt";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { decisions: { orderBy: { number: "asc" } } },
  });

  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const knowledge = parseProjectKnowledge(project.knowledge);
  const prompt = buildPlanPrompt(project.name, knowledge, project.decisions);

  const { text } = await generateText({
    model: getLanguageModel(),
    prompt,
  });

  const developmentPlan = { markdown: text, generatedAt: new Date().toISOString() };
  const updatedKnowledge = { ...knowledge, developmentPlan };

  await prisma.project.update({
    where: { id: projectId },
    data: { knowledge: updatedKnowledge },
  });

  return NextResponse.json({ developmentPlan });
}
