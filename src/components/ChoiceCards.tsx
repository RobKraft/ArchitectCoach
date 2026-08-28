export type ChoiceCardOption = {
  id: string;
  label: string;
  summary?: string;
  tradeoffs?: string;
  recommended?: boolean;
};

export default function ChoiceCards({
  question,
  options,
  onSelect,
  disabled,
}: {
  question: string;
  options: ChoiceCardOption[];
  onSelect: (option: ChoiceCardOption) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3 border-t border-stone-200 p-4">
      <p className="text-sm font-medium text-stone-700">{question}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <div key={opt.id} className="flex flex-col gap-2 rounded-lg border border-stone-300 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-stone-800">{opt.label}</span>
              {opt.recommended && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Recommended
                </span>
              )}
            </div>
            {opt.summary && <p className="text-sm text-stone-600">{opt.summary}</p>}
            {opt.tradeoffs && (
              <details className="text-sm text-stone-600">
                <summary className="cursor-pointer font-medium text-stone-700">Tradeoffs</summary>
                <p className="mt-1">{opt.tradeoffs}</p>
              </details>
            )}
            <button
              type="button"
              onClick={() => onSelect(opt)}
              disabled={disabled}
              className="mt-auto rounded bg-ink px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Choose {opt.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
