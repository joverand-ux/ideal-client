import type { RoadmapPhase } from "@/lib/reportGenerator";

export function RoadmapTimeline({ roadmap }: { roadmap: RoadmapPhase[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {roadmap.map((phase, i) => (
        <div key={phase.phase} className="relative rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="text-sm font-semibold text-slate-900">{phase.phase}</span>
          </div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-blue-500">{phase.focus}</p>
          <ul className="space-y-2">
            {phase.items.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
