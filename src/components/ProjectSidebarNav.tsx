"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sectionCompletion, type ProjectKnowledge } from "@/lib/knowledge/types";

const NAV_ITEMS = [
  { href: "", label: "Overview" },
  { href: "/interview", label: "Interview" },
  { href: "/requirements", label: "Requirements", key: "requirements" },
  { href: "/architecture", label: "Architecture", key: "architecture" },
  { href: "/technology", label: "Technology", key: "technology" },
  { href: "/decisions", label: "Decision Records" },
  { href: "/plan", label: "Development Plan", key: "developmentPlan" },
] as const;

export default function ProjectSidebarNav({
  projectId,
  projectName,
  knowledge,
}: {
  projectId: string;
  projectName: string;
  knowledge: ProjectKnowledge;
}) {
  const pathname = usePathname();
  const completion = sectionCompletion(knowledge);
  const base = `/projects/${projectId}`;

  return (
    <nav className="w-56 shrink-0">
      <Link href="/" className="text-sm text-stone-500 hover:underline">
        ← All projects
      </Link>
      <h1 className="mt-2 text-lg font-semibold leading-tight">{projectName}</h1>
      <ul className="mt-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const href = `${base}${item.href}`;
          const active = pathname === href;
          const key = "key" in item ? item.key : undefined;
          const done = key ? completion[key as keyof typeof completion] : undefined;
          return (
            <li key={item.href}>
              <Link
                href={href}
                className={`flex items-center justify-between rounded px-2 py-1.5 text-sm ${
                  active ? "bg-stone-200 font-medium" : "hover:bg-stone-100"
                }`}
              >
                <span>{item.label}</span>
                {done !== undefined && (
                  <span className={done ? "text-green-600" : "text-stone-300"}>
                    {done ? "✓" : "○"}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
