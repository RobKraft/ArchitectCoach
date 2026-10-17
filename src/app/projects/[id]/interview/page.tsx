import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseInterviewState, parsePendingChoice, parseProjectKnowledge } from "@/lib/knowledge/types";
import { WIZARD_CATALOG } from "@/lib/wizard/catalog";
import { buildDiscussPrompt } from "@/lib/wizard/discussPrompt";
import { getStepAssessments } from "@/lib/wizard/assessments";
import ChatPanel from "@/components/ChatPanel";
import WizardStepView from "@/components/WizardStepView";

export default async function InterviewPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { decisions: { orderBy: { number: "asc" } } },
  });
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
          <WizardStepView
            key={step.id}
            projectId={project.id}
            step={step}
            assessments={getStepAssessments(step.id)}
            discussPrompt={buildDiscussPrompt(
              project.name,
              parseProjectKnowledge(project.knowledge),
              project.decisions,
              step
            )}
          />
        ) : (
          <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-5">
            <p className="font-medium">You&rsquo;ve answered every question for this project type.</p>
            <p className="text-sm text-stone-600">
              Review what was captured on the Requirements, Architecture, Technology, and Decisions
              tabs. Then download your Spec Kit: it works with{" "}
              <a href="https://github.com/github/spec-kit" className="underline" target="_blank" rel="noreferrer">
                GitHub Spec Kit
              </a>{" "}
              so your own AI coding agent asks the remaining questions and writes the spec, plan, and
              task list with you.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/projects/${project.id}/plan`}
                className="inline-block rounded bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
              >
                Go to Plan
              </Link>
              <a
                href={`/api/projects/${project.id}/devkit`}
                className="inline-block rounded border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:border-ink hover:text-ink"
              >
                Download Spec Kit
              </a>
            </div>
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
