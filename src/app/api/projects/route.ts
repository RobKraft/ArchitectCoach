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

  const project = await prisma.project.create({
    data: {
      name,
      oneLinePurpose:
        typeof body?.oneLinePurpose === "string" ? body.oneLinePurpose.trim() : "",
      knowledge: emptyProjectKnowledge(),
      interviewState: initialInterviewState(),
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
