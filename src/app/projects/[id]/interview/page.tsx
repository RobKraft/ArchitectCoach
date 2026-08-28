import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseInterviewState, parsePendingChoice } from "@/lib/knowledge/types";
import { WIZARD_CATALOG } from "@/lib/wizard/catalog";
import ChatPanel from "@/components/ChatPanel";
import WizardStepView from "@/components/WizardStepView";

export default async function InterviewPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();

  const steps = WIZARD_CATALOG[project.name];

  if (steps) {
    const state = parseInterviewState(project.interviewState);
    const step = steps[state.stepIndex];

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Interview</h2>
        <p className="text-sm text-stone-600">
          Pick the option that&rsquo;s closest to your project at each step — every question shows
          the tradeoffs before you choose.
        </p>
        {step ? (
          <WizardStepView key={step.id} projectId={project.id} step={step} />
        ) : (
          <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-5">
            <p className="font-medium">You&rsquo;ve answered every question for this project type.</p>
            <p className="text-sm text-stone-600">
              Review what was captured on the Requirements, Architecture, Technology, and Decisions
              tabs, or generate a development plan from it.
            </p>
            <Link
              href={`/projects/${project.id}/plan`}
              className="inline-block rounded bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
            >
              Go to Plan
            </Link>
          </div>
        )}
      </div>
    );
  }

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
        initialPrompt={project.oneLinePurpose || undefined}
        initialPendingChoice={parsePendingChoice(project.pendingChoice)}
      />
    </div>
  );
}
