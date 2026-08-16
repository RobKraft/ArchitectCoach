import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseProjectKnowledge } from "@/lib/knowledge/types";
import { Section, Empty, BulletsOrEmpty } from "@/components/SectionPage";

export default async function RequirementsPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();
  const { requirements } = parseProjectKnowledge(project.knowledge);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Requirements</h2>
      <Section title="Purpose">
        <p>{requirements.purpose || <Empty />}</p>
      </Section>
      <Section title="Users">
        <BulletsOrEmpty items={requirements.users} />
      </Section>
      <Section title="Goals">
        <BulletsOrEmpty items={requirements.goals} />
      </Section>
      <Section title="Non-goals">
        <BulletsOrEmpty items={requirements.nonGoals} />
      </Section>
      <Section title="Functional requirements">
        <BulletsOrEmpty items={requirements.functionalRequirements} />
      </Section>
    </div>
  );
}
