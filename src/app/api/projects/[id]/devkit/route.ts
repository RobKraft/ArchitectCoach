import archiver from "archiver";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseProjectKnowledge } from "@/lib/knowledge/types";
import { DEVKIT_SUPPORTED_TYPES, generateDevKitFiles } from "@/lib/devkit/generate";
import { generateSpecKitFiles } from "@/lib/speckit/generate";
import { WIZARD_CATALOG } from "@/lib/wizard/catalog";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { decisions: { orderBy: { number: "asc" } } },
  });

  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (!WIZARD_CATALOG[project.name]) {
    return NextResponse.json(
      { error: `No Spec Kit is available for project type "${project.name}".` },
      { status: 400 }
    );
  }

  // The Spec Kit inputs work for every wizard project type; the tailored standards docs
  // (coding/testing standards, checklists, ADRs) exist only for DEVKIT_SUPPORTED_TYPES so far.
  const knowledge = parseProjectKnowledge(project.knowledge);
  const files = {
    ...(DEVKIT_SUPPORTED_TYPES.has(project.name)
      ? generateDevKitFiles(project.name, knowledge, project.decisions)
      : {}),
    ...generateSpecKitFiles(project.name, knowledge),
  };

  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<void>((resolve, reject) => {
    archive.on("end", resolve);
    archive.on("error", reject);
  });

  for (const [path, content] of Object.entries(files)) {
    archive.append(content, { name: path });
  }
  await archive.finalize();
  await done;

  const zipBuffer = Buffer.concat(chunks);
  const fileName = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-spec-kit.zip`;

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
