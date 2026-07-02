import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { StoredScan, ScanStatus } from "@/lib/localStorage";

const STATUS_STYLES: Record<ScanStatus, string> = {
  New: "bg-blue-50 text-blue-600",
  "In Review": "bg-amber-50 text-amber-600",
  "Sent to Client": "bg-emerald-50 text-emerald-600",
  Archived: "bg-slate-100 text-slate-500",
};

export function DashboardScanCard({ scan }: { scan: StoredScan }) {
  const companyName = scan.analysis?.companyNameGuess ?? scan.request.companyName ?? "Untitled Scan";
  const industry = scan.analysis?.industryGuess ?? scan.request.industry ?? "Pending analysis";
  const topOpportunity = scan.report?.recommendations[0]?.title ?? "Scan in progress…";

  return (
    <Link
      href={`/aiscanner/report/${scan.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{companyName}</h3>
        <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition-colors group-hover:text-blue-500" />
      </div>
      <p className="mb-3 truncate text-xs text-slate-400">{scan.request.url}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{industry}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[scan.status]}`}>{scan.status}</span>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
          {scan.report?.readinessScore ?? "—"}
        </div>
        <div>
          <p className="text-xs text-slate-400">Readiness Score</p>
          <p className="text-xs font-medium text-slate-600">Top opportunity: {topOpportunity}</p>
        </div>
      </div>

      <p className="mt-auto border-t border-slate-100 pt-3 text-xs text-slate-400">
        Scanned {new Date(scan.request.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
      </p>
    </Link>
  );
}
