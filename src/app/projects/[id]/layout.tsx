import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseProjectKnowledge } from "@/lib/knowledge/types";
import ProjectSidebarNav from "@/components/ProjectSidebarNav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();
  const knowledge = parseProjectKnowledge(project.knowledge);

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
      <ProjectSidebarNav projectId={project.id} projectName={project.name} knowledge={knowledge} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
