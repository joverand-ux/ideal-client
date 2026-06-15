"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/spinner";

interface Stats {
  totalProspects: number;
  researched: number;
  scored: number;
  outreachReady: number;
  inCrm: number;
  avgFitScore: number;
  highOpportunities: number;
  recentProspects: Array<{ id: string; companyName: string; fitScore: number | null; status: string; opportunityRating: string | null }>;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-700 text-gray-300",
  RESEARCHING: "bg-yellow-900 text-yellow-300",
  RESEARCHED: "bg-blue-900 text-blue-300",
  SCORED: "bg-purple-900 text-purple-300",
  OUTREACH_READY: "bg-green-900 text-green-300",
  IN_CRM: "bg-teal-900 text-teal-300",
  ARCHIVED: "bg-red-900 text-red-300",
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

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Spinner /><span>Loading…</span></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Turn Business Signals Into Qualified Conversations.</p>
      </div>

      {!stats || stats.totalProspects === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl font-medium text-gray-400">Welcome to ConnectIQ</p>
          <p className="text-sm mt-2">Get started by setting up your <Link href="/profile" className="text-blue-400 hover:underline">Client Profile</Link> and adding <Link href="/prospects" className="text-blue-400 hover:underline">Prospects</Link>.</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Prospects", value: stats.totalProspects },
              { label: "Researched", value: stats.researched },
              { label: "Outreach Ready", value: stats.outreachReady },
              { label: "In CRM", value: stats.inCrm },
            ].map((s) => (
              <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center gap-4">
              <div>
                <div className="text-4xl font-bold text-blue-400">{stats.avgFitScore}</div>
                <div className="text-sm text-gray-400 mt-1">Avg Fit Score</div>
              </div>
              <div className="flex-1">
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.avgFitScore}%` }} />
                </div>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
              <div className="text-4xl font-bold text-green-400">{stats.highOpportunities}</div>
              <div className="text-sm text-gray-400 mt-1">High Opportunities</div>
            </div>
          </div>

          {/* Recent prospects */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent Prospects</h2>
              <Link href="/prospects" className="text-xs text-blue-400 hover:underline">View all →</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Company</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Fit Score</th>
                  <th className="text-left px-5 py-3">Opportunity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {stats.recentProspects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-700/20">
                    <td className="px-5 py-3 font-medium text-white">{p.companyName}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || "bg-gray-700 text-gray-300"}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {p.fitScore !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.fitScore}%` }} />
                          </div>
                          <span className="text-white text-xs">{p.fitScore}</span>
                        </div>
                      ) : <span className="text-gray-500">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {p.opportunityRating ? (
                        <span className={`text-xs font-medium ${p.opportunityRating === "HIGH" ? "text-green-400" : p.opportunityRating === "MEDIUM" ? "text-yellow-400" : "text-gray-400"}`}>
                          {p.opportunityRating}
                        </span>
                      ) : <span className="text-gray-500">—</span>}
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
