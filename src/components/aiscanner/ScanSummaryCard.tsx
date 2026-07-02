import { Globe, Calendar, Gauge } from "lucide-react";
import type { ScanRequest, ScanStatus } from "@/lib/localStorage";
import type { WebsiteAnalysis } from "@/lib/mockWebsiteAnalyzer";

const STATUS_STYLES: Record<ScanStatus, string> = {
  New: "bg-blue-50 text-blue-600",
  "In Review": "bg-amber-50 text-amber-600",
  "Sent to Client": "bg-emerald-50 text-emerald-600",
  Archived: "bg-slate-100 text-slate-500",
};

export function ScanSummaryCard({
  request,
  analysis,
  status,
}: {
  request: ScanRequest;
  analysis: WebsiteAnalysis;
  status: ScanStatus;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{analysis.companyNameGuess}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>{status}</span>
          </div>
          <a
            href={request.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-500 hover:underline"
          >
            <Globe size={14} />
            {request.url}
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {analysis.industryGuess}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <Calendar size={12} />
            {new Date(request.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            <Gauge size={12} />
            {analysis.scanConfidence}% Scan Confidence
          </span>
        </div>
      </div>
    </div>
  );
}
