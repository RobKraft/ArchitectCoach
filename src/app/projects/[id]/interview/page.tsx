import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ChatPanel from "@/components/ChatPanel";

export default async function InterviewPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();

  const messages = await prisma.message.findMany({
    where: { projectId: project.id, role: { in: ["user", "assistant"] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Interview</h2>
      <p className="text-sm text-stone-600">
        Talk through what you&rsquo;re building. ArchitectCoach asks one question at a time,
        explains why it matters, and saves what you decide as you go — leave any time and come
        back to exactly this point.
      </p>
      <ChatPanel
        projectId={project.id}
        initialMessages={messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
      />
    </div>
  );
}
