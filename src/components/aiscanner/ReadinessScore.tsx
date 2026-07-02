interface ReadinessScoreProps {
  score: number;
  label?: string;
}

function bandFor(score: number): { label: string; color: string; ring: string } {
  if (score >= 80) return { label: "High Readiness", color: "text-emerald-500", ring: "stroke-emerald-500" };
  if (score >= 55) return { label: "Moderate Readiness", color: "text-blue-500", ring: "stroke-blue-500" };
  return { label: "Early Stage", color: "text-amber-500", ring: "stroke-amber-500" };
}

export function ReadinessScore({ score, label = "AIScanner Readiness Score" }: ReadinessScoreProps) {
  const band = bandFor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r={radius} strokeWidth="10" className="fill-none stroke-slate-100" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="10"
            strokeLinecap="round"
            className={`fill-none ${band.ring} transition-all duration-700 ease-out`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className={`text-lg font-semibold ${band.color}`}>{band.label}</p>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          Composite of digital maturity, website signals, and scan confidence.
        </p>
      </div>
    </div>
  );
}
