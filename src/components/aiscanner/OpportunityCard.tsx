import { Sparkles } from "lucide-react";
import type { Recommendation } from "@/lib/reportGenerator";

const EFFORT_STYLES: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-600",
  Medium: "bg-amber-50 text-amber-600",
  High: "bg-red-50 text-red-600",
};

const CONFIDENCE_STYLES: Record<string, string> = {
  High: "bg-blue-50 text-blue-600",
  Medium: "bg-slate-100 text-slate-600",
  Low: "bg-slate-100 text-slate-400",
};

export function OpportunityCard({ recommendation, rank }: { recommendation: Recommendation; rank?: number }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {rank && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {rank}
            </span>
          )}
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">{recommendation.department}</span>
        </div>
        <Sparkles size={16} className="shrink-0 text-blue-300" />
      </div>

      <h3 className="mb-2 text-base font-semibold text-slate-900">{recommendation.title}</h3>

      <p className="mb-3 text-sm text-slate-500">
        <span className="font-medium text-slate-700">Problem: </span>
        {recommendation.problem}
      </p>
      <p className="mb-4 text-sm text-slate-500">
        <span className="font-medium text-slate-700">AI Solution: </span>
        {recommendation.aiSolution}
      </p>

      <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span className="font-medium">Estimated impact: </span>
        {recommendation.estimatedImpact}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${EFFORT_STYLES[recommendation.implementationEffort]}`}>
          {recommendation.implementationEffort} Effort
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CONFIDENCE_STYLES[recommendation.confidenceLevel]}`}>
          {recommendation.confidenceLevel} Confidence
        </span>
      </div>

      <p className="mt-auto border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span className="font-medium text-slate-500">Why AIScanner detected this: </span>
        {recommendation.whyDetected}
      </p>
    </div>
  );
}
