import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function DecisionsPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { decisions: { orderBy: { number: "asc" } } },
  });
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Decision Records</h2>
      {project.decisions.length === 0 ? (
        <p className="text-stone-500">
          No decisions recorded yet — these show up as you go through the interview and make real
          choices. Six months from now, this page answers &ldquo;why did we do it this way?&rdquo;
        </p>
      ) : (
        <ul className="space-y-3">
          {project.decisions.map((d) => (
            <li key={d.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <Link
                href={`/projects/${project.id}/decisions/${d.number}`}
                className="font-medium hover:underline"
              >
                Decision #{d.number} — {d.title}
              </Link>
              <p className="mt-1 text-sm text-stone-600">{d.decision}</p>
              <span className="mt-2 inline-block rounded bg-stone-100 px-2 py-0.5 text-xs uppercase tracking-wide text-stone-500">
                {d.section}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
