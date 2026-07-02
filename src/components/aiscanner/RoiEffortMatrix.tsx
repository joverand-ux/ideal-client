import type { Recommendation } from "@/lib/reportGenerator";

interface RoiEffortMatrixProps {
  recommendations: Recommendation[];
}

export function RoiEffortMatrix({ recommendations }: RoiEffortMatrixProps) {
  return (
    <div className="flex gap-2">
      <div className="flex shrink-0 items-center">
        <span className="[writing-mode:vertical-rl] rotate-180 text-xs text-slate-400">↑ ROI</span>
      </div>
      <div className="w-full">
      <div className="relative aspect-square w-full max-w-lg rounded-xl border border-slate-200 bg-slate-50 sm:aspect-[4/3]">
        {/* Quadrant labels */}
        <span className="absolute left-3 top-3 text-xs font-medium text-emerald-500">Quick Wins</span>
        <span className="absolute right-3 top-3 text-xs font-medium text-blue-500">Major Projects</span>
        <span className="absolute bottom-3 left-3 text-xs font-medium text-slate-400">Fill-ins</span>
        <span className="absolute bottom-3 right-3 text-xs font-medium text-amber-500">Reconsider</span>

        {/* Quadrant divider lines */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-200" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-slate-200" />

        {recommendations.map((rec) => {
          const left = Math.min(94, Math.max(4, (rec.effortScore / 10) * 100));
          const bottom = Math.min(94, Math.max(4, (rec.roiScore / 10) * 100));
          return (
            <div
              key={rec.id}
              title={`${rec.title} — ROI ${rec.roiScore}/10, Effort ${rec.effortScore}/10`}
              className="group absolute -translate-x-1/2 translate-y-1/2 cursor-default"
              style={{ left: `${left}%`, bottom: `${bottom}%` }}
            >
              <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow transition-transform group-hover:scale-125" />
              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                {rec.title}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-xs text-slate-400">
        <span>Low Effort</span>
        <span>High Effort →</span>
      </div>
      </div>
    </div>
  );
}
