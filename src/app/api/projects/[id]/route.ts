import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseInterviewState, parseProjectKnowledge } from "@/lib/knowledge/types";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { decisions: { orderBy: { number: "asc" } } },
  });

  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    project: {
      ...project,
      knowledge: parseProjectKnowledge(project.knowledge),
      interviewState: parseInterviewState(project.interviewState),
    },
  });
}
