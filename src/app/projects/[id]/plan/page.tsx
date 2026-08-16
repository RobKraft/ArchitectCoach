import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseProjectKnowledge } from "@/lib/knowledge/types";
import PlanPanel from "@/components/PlanPanel";

export default async function PlanPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();
  const { developmentPlan } = parseProjectKnowledge(project.knowledge);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Development Plan</h2>
      <PlanPanel projectId={project.id} initialPlan={developmentPlan} />
    </div>
  );
}
