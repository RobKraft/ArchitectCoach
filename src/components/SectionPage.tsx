import type { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="font-medium">{title}</h3>
      <div className="mt-2 text-sm text-stone-700">{children}</div>
    </div>
  );
}

export function Empty() {
  return (
    <span className="text-stone-400">
      Not yet defined — this fills in as you go through the interview.
    </span>
  );
}

export function BulletsOrEmpty({ items }: { items: string[] }) {
  if (!items.length) return <Empty />;
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
