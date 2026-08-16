import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseProjectKnowledge } from "@/lib/knowledge/types";
import { Section, Empty, BulletsOrEmpty } from "@/components/SectionPage";

export default async function ArchitecturePage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();
  const { architecture } = parseProjectKnowledge(project.knowledge);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Architecture</h2>
      <Section title="Style">
        <p>{architecture.style || <Empty />}</p>
      </Section>
      <Section title="Components">
        <BulletsOrEmpty items={architecture.components} />
      </Section>
      <Section title="Data flow">
        <p>{architecture.dataFlow || <Empty />}</p>
      </Section>
      {architecture.notes && (
        <Section title="Notes">
          <p>{architecture.notes}</p>
        </Section>
      )}
    </div>
  );
}
