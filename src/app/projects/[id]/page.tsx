import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseProjectKnowledge, sectionCompletion } from "@/lib/knowledge/types";

export default async function ProjectOverviewPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { decisions: true },
  });
  if (!project) notFound();

  const knowledge = parseProjectKnowledge(project.knowledge);
  const completion = sectionCompletion(knowledge);
  const started = Object.values(completion).some(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{project.name}</h2>
        {project.oneLinePurpose && <p className="text-stone-600">{project.oneLinePurpose}</p>}
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="font-medium">Progress</h3>
        <ul className="mt-2 space-y-1 text-sm">
          <li>{completion.requirements ? "✓" : "○"} Requirements</li>
          <li>{completion.architecture ? "✓" : "○"} Architecture</li>
          <li>{completion.technology ? "✓" : "○"} Technology</li>
          <li>{completion.developmentPlan ? "✓" : "○"} Development plan</li>
        </ul>
        <p className="mt-3 text-sm text-stone-600">
          {project.decisions.length} decision record{project.decisions.length === 1 ? "" : "s"} so
          far.
        </p>
      </div>

      <Link
        href={`/projects/${project.id}/interview`}
        className="inline-block rounded bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
      >
        {started ? "Continue the interview" : "Start the interview"}
      </Link>
    </div>
  );
}
