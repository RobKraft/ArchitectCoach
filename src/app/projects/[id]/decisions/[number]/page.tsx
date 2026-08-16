import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import DecisionCard from "@/components/DecisionCard";

export default async function DecisionDetailPage({
  params,
}: {
  params: { id: string; number: string };
}) {
  const number = Number(params.number);
  if (!Number.isInteger(number)) notFound();

  const decision = await prisma.decisionRecord.findFirst({
    where: { projectId: params.id, number },
  });
  if (!decision) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">
        Decision #{decision.number} — {decision.title}
      </h2>
      <DecisionCard decision={decision} />
    </div>
  );
}
