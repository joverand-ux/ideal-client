"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/spinner";
import { Zap, TrendingUp, Target } from "lucide-react";

interface TopProspect {
  id: string; companyName: string; connectiqScore: number | null;
  priorityTier: string | null; status: string; estimatedPipelineValue: string | null; industry: string | null;
}
interface RecentProspect {
  id: string; companyName: string; connectiqScore: number | null;
  fitScore: number | null; status: string; opportunityRating: string | null; priorityTier: string | null;
}
interface Stats {
  totalProspects: number; hot: number; warm: number;
  outreachReady: number; inCrm: number;
  avgConnectiqScore: number; highOpportunities: number;
  top10Prospects: TopProspect[]; recentProspects: RecentProspect[];
}

const TIER_DOT: Record<string, string> = {
  HOT: "bg-red-500", WARM: "bg-orange-400", FUTURE: "bg-gray-400",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-600",
  RESEARCHING: "bg-yellow-50 text-yellow-700",
  RESEARCHED: "bg-blue-50 text-blue-700",
  SCORED: "bg-purple-50 text-purple-700",
  OUTREACH_READY: "bg-green-50 text-green-700",
  IN_CRM: "bg-teal-50 text-teal-700",
  ARCHIVED: "bg-red-50 text-red-700",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d as Stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center gap-2 text-gray-500"><Spinner /><span>Loading…</span></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Turn Business Signals Into Qualified Conversations.</p>
      </div>

      {!stats || stats.totalProspects === 0 ? (
        <div className="text-center py-20">
          <Zap size={40} className="mx-auto mb-4 text-indigo-500" />
          <p className="text-xl font-medium text-gray-900">Welcome to ConnectIQ</p>
          <p className="text-sm mt-2 text-gray-500">
            Start by setting up your <Link href="/profile" className="text-indigo-600 hover:underline">Client Profile</Link>,
            then use <Link href="/prospects" className="text-indigo-600 hover:underline">Discover</Link> to find your ideal prospects.
          </p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Prospects", value: stats.totalProspects, color: "text-gray-900" },
              { label: "HOT", value: stats.hot, color: "text-red-600" },
              { label: "WARM", value: stats.warm, color: "text-orange-500" },
              { label: "Outreach Ready", value: stats.outreachReady, color: "text-green-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <Target size={28} className="text-indigo-500 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="text-3xl font-bold text-indigo-600">{stats.avgConnectiqScore}</div>
                  <div className="text-sm text-gray-500">Avg ConnectIQ Score</div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.avgConnectiqScore}%` }} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <TrendingUp size={28} className="text-green-500 shrink-0" />
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.highOpportunities}</div>
                <div className="text-sm text-gray-500">High Opportunities</div>
              </div>
            </div>
          </div>

          {/* Top 10 */}
          {stats.top10Prospects.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Zap size={16} className="text-indigo-500" /> Top 10 Highest-Value Prospects
                </h2>
                <Link href="/prospects" className="text-xs text-indigo-600 hover:underline">View all</Link>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wide bg-gray-50">
                    <th className="text-left px-5 py-3">#</th>
                    <th className="text-left px-5 py-3">Company</th>
                    <th className="text-left px-5 py-3">Priority</th>
                    <th className="text-left px-5 py-3">Score</th>
                    <th className="text-left px-5 py-3 hidden lg:table-cell">Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.top10Prospects.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{p.companyName}</div>
                        {p.industry && <div className="text-xs text-gray-400">{p.industry}</div>}
                      </td>
                      <td className="px-5 py-3">
                        {p.priorityTier && (
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${TIER_DOT[p.priorityTier] || "bg-gray-400"}`} />
                            <span className="text-xs text-gray-600">{p.priorityTier}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${(p.connectiqScore ?? 0) >= 70 ? "bg-red-500" : (p.connectiqScore ?? 0) >= 45 ? "bg-orange-500" : "bg-blue-400"}`}
                              style={{ width: `${p.connectiqScore ?? 0}%` }} />
                          </div>
                          <span className="text-gray-900 text-xs font-bold">{p.connectiqScore}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell">
                        {p.estimatedPipelineValue ? (
                          <span className="text-green-600 text-xs">{p.estimatedPipelineValue}</span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recently Added</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wide bg-gray-50">
                  <th className="text-left px-5 py-3">Company</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentProspects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {p.priorityTier && <div className={`w-2 h-2 rounded-full shrink-0 ${TIER_DOT[p.priorityTier] || "bg-gray-400"}`} />}
                        <span className="font-medium text-gray-900">{p.companyName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-900 text-xs font-bold">
                      {p.connectiqScore ?? p.fitScore ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
