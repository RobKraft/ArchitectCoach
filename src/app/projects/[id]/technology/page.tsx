import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseProjectKnowledge } from "@/lib/knowledge/types";
import { Section, Empty, BulletsOrEmpty } from "@/components/SectionPage";

export default async function TechnologyPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();
  const { technology } = parseProjectKnowledge(project.knowledge);

  const fields: [string, string][] = [
    ["Frontend", technology.frontend],
    ["Backend", technology.backend],
    ["Database", technology.database],
    ["Hosting", technology.hosting],
    ["Authentication", technology.authentication],
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Technology</h2>
      {fields.map(([label, value]) => (
        <Section key={label} title={label}>
          <p>{value || <Empty />}</p>
        </Section>
      ))}
      <Section title="Third-party services">
        <BulletsOrEmpty items={technology.thirdPartyServices} />
      </Section>
    </div>
  );
}
