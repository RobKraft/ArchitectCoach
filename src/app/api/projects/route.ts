import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emptyProjectKnowledge, initialInterviewState } from "@/lib/knowledge/defaults";

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const oneLinePurpose = typeof body?.oneLinePurpose === "string" ? body.oneLinePurpose.trim() : "";
  const knowledge = emptyProjectKnowledge();
  // No AI turn runs before the wizard's first question, so seed the one piece of
  // requirements knowledge that's already known from project creation directly.
  knowledge.requirements.purpose = oneLinePurpose;

  const project = await prisma.project.create({
    data: {
      name,
      oneLinePurpose,
      knowledge,
      interviewState: initialInterviewState(),
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
