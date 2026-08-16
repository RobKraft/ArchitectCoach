import Link from "next/link";
import { prisma } from "@/lib/db";
import NewProjectForm from "@/components/NewProjectForm";

export default async function HomePage() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">ArchitectCoach</h1>
      <p className="mt-2 text-stone-600">
        An AI architectural coach: it helps you make the important decisions before and during
        building software, explains why they matter, and keeps a persistent, reasoned record of
        your project so you can pick up exactly where you left off.
      </p>

      <div className="mt-8">
        <NewProjectForm />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium">Your projects</h2>
        {projects.length === 0 ? (
          <p className="mt-2 text-stone-500">No projects yet — start one above.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {projects.map((p) => (
              <li key={p.id} className="rounded-lg border border-stone-200 bg-white p-4">
                <Link href={`/projects/${p.id}`} className="font-medium hover:underline">
                  {p.name}
                </Link>
                {p.oneLinePurpose && <p className="text-sm text-stone-600">{p.oneLinePurpose}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
