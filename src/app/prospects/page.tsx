"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, X, Search, ExternalLink, Copy, Check, Zap, TrendingUp, Target, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/spinner";

interface Signal { id: string; type: string; title: string; description: string | null; source: string | null; }
interface Draft { id: string; type: string; subject: string | null; body: string; }
interface Prospect {
  id: string; companyName: string; website: string | null; industry: string | null;
  location: string | null; employeeCount: number | null; revenueEstimate: string | null;
  status: string; fitScore: number | null; fitReason: string | null;
  confidenceScore: number | null; opportunityRating: string | null;
  recommendedConversation: string | null; companySummary: string | null;
  services: string[]; marketsServed: string[]; locations: string[];
  leadershipInfo: string | null; keyDecisionMakers: string | null;
  linkedinUrl: string | null; technologyNeed: string | null;
  businessSignals: Signal[]; outreachDrafts: Draft[];
  icpId: string | null; priorityTier: string | null;
  connectiqScore: number | null; growthSignalsScore: number | null;
  technologyScore: number | null; revenuePotentialScore: number | null;
  companySizeFitScore: number | null; triggerEventsScore: number | null;
  aiAutomationScore: number | null; estimatedPipelineValue: string | null;
  sourceCompany: string | null;
}
interface ICP { id: string; name: string; }

const TIER_STYLES: Record<string, string> = {
  HOT: "bg-red-900 text-red-300 border-red-700",
  WARM: "bg-orange-900 text-orange-300 border-orange-700",
  FUTURE: "bg-gray-700 text-gray-300 border-gray-600",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-700 text-gray-300",
  RESEARCHING: "bg-yellow-900 text-yellow-300",
  RESEARCHED: "bg-blue-900 text-blue-300",
  SCORED: "bg-purple-900 text-purple-300",
  OUTREACH_READY: "bg-green-900 text-green-300",
  IN_CRM: "bg-teal-900 text-teal-300",
  ARCHIVED: "bg-red-900 text-red-300",
};

const OUTREACH_TABS = [
  { key: "EMAIL", label: "Executive Email" },
  { key: "LINKEDIN", label: "LinkedIn" },
  { key: "VALUE_INTRO", label: "Value Intro" },
  { key: "CALL_SCRIPT", label: "Call Script" },
  { key: "MEETING_BRIEF", label: "Meeting Brief" },
];

function ScoreBar({ label, value, max, color }: { label: string; value: number | null; max: number; color: string }) {
  const pct = value != null ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value ?? 0}/{max}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [icps, setIcps] = useState<ICP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [researchingId, setResearchingId] = useState<string | null>(null);
  const [outreachingId, setOutreachingId] = useState<string | null>(null);
  const [hubspotingId, setHubspotingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("EMAIL");
  const [copied, setCopied] = useState(false);
  const [addForm, setAddForm] = useState({ companyName: "", website: "", industry: "", location: "", employeeCount: "", icpId: "" });
  const [adding, setAdding] = useState(false);
  const [discoverForm, setDiscoverForm] = useState({ targetCompany: "", icpId: "", count: "25" });
  const [discovering, setDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<{ count: number; hot: number; warm: number; future: number } | null>(null);

  const load = useCallback(async () => {
    const [pRes, iRes] = await Promise.all([fetch("/api/prospects"), fetch("/api/icps")]);
    const pData = await pRes.json() as Prospect[];
    const iData = await iRes.json() as ICP[];
    setProspects(Array.isArray(pData) ? pData : []);
    setIcps(Array.isArray(iData) ? iData : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = prospects.filter((p) => {
    const matchSearch = p.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (p.industry || "").toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === "ALL" || p.priorityTier === tierFilter;
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchTier && matchStatus;
  });

  const research = async (id: string) => {
    setResearchingId(id);
    const r = await fetch(`/api/prospects/${id}/research`, { method: "POST" });
    if (r.ok) {
      const updated = await r.json() as Prospect;
      setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      if (selected?.id === id) setSelected((s) => s ? { ...s, ...updated } : s);
    }
    setResearchingId(null);
  };

  const generateOutreach = async (id: string) => {
    setOutreachingId(id);
    const r = await fetch(`/api/prospects/${id}/outreach`, { method: "POST" });
    if (r.ok) {
      const fresh = await fetch(`/api/prospects/${id}`).then((res) => res.json()) as Prospect;
      setProspects((prev) => prev.map((p) => (p.id === id ? fresh : p)));
      if (selected?.id === id) setSelected(fresh);
    }
    setOutreachingId(null);
    setActiveTab("EMAIL");
  };

  const syncHubspot = async (id: string) => {
    setHubspotingId(id);
    const r = await fetch(`/api/prospects/${id}/hubspot`, { method: "POST" });
    if (r.ok) {
      const fresh = await fetch(`/api/prospects/${id}`).then((res) => res.json()) as Prospect;
      setProspects((prev) => prev.map((p) => (p.id === id ? fresh : p)));
      if (selected?.id === id) setSelected(fresh);
    }
    setHubspotingId(null);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this prospect?")) return;
    await fetch(`/api/prospects/${id}`, { method: "DELETE" });
    setProspects((prev) => prev.filter((p) => p.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const addProspect = async () => {
    if (!addForm.companyName) return;
    setAdding(true);
    await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addForm, employeeCount: addForm.employeeCount ? Number(addForm.employeeCount) : undefined, icpId: addForm.icpId || undefined }),
    });
    await load();
    setAdding(false);
    setShowAddModal(false);
    setAddForm({ companyName: "", website: "", industry: "", location: "", employeeCount: "", icpId: "" });
  };

  const runDiscover = async () => {
    if (!discoverForm.targetCompany.trim()) return;
    setDiscovering(true);
    setDiscoverResult(null);
    const r = await fetch("/api/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetCompanyName: discoverForm.targetCompany,
        icpId: discoverForm.icpId || undefined,
        count: Number(discoverForm.count) || 25,
      }),
    });
    if (r.ok) {
      const data = await r.json() as { count: number; hot: number; warm: number; future: number };
      setDiscoverResult(data);
      await load();
    }
    setDiscovering(false);
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const activeDraft = selected?.outreachDrafts?.find((d) => d.type === activeTab);

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Spinner /><span>Loading…</span></div>;

  const hot = prospects.filter((p) => p.priorityTier === "HOT").length;
  const warm = prospects.filter((p) => p.priorityTier === "WARM").length;

  return (
    <div className="flex gap-6 h-full">
      {/* Main panel */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Prospects <span className="text-sm font-normal text-gray-400 ml-2">{prospects.length} total</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">AI-powered prospect intelligence engine.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowDiscoverModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Zap size={15} /> Discover
            </button>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus size={15} /> Add
            </button>
          </div>
        </div>

        {/* Priority summary */}
        {prospects.length > 0 && (
          <div className="flex gap-3 mb-4">
            {[
              { label: "HOT", count: hot, color: "text-red-400" },
              { label: "WARM", count: warm, color: "text-orange-400" },
              { label: "FUTURE", count: prospects.length - hot - warm, color: "text-gray-400" },
            ].map((t) => (
              <button key={t.label} onClick={() => setTierFilter(tierFilter === t.label ? "ALL" : t.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                  ${tierFilter === t.label ? "bg-gray-700 border-gray-500" : "bg-gray-800 border-gray-700 hover:border-gray-600"}`}>
                <span className={t.color}>{t.label}</span>
                <span className="text-white font-bold">{t.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Search + filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search prospects…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm outline-none focus:border-blue-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500">
            {["ALL", "NEW", "RESEARCHING", "SCORED", "OUTREACH_READY", "IN_CRM", "ARCHIVED"].map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Zap size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-lg text-gray-400">No prospects yet.</p>
            <p className="text-sm mt-1">Use <span className="text-purple-400 font-medium">Discover</span> to find companies similar to your best customers.</p>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Industry</th>
                  <th className="text-left px-4 py-3">Priority</th>
                  <th className="text-left px-4 py-3">ConnectIQ</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-700/30 transition-colors cursor-pointer" onClick={() => { setSelected(p); setActiveTab("EMAIL"); }}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{p.companyName}</div>
                      <div className="text-xs text-gray-500">{p.location || p.revenueEstimate || ""}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">{p.industry || "—"}</td>
                    <td className="px-4 py-3">
                      {p.priorityTier ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_STYLES[p.priorityTier] || "bg-gray-700 text-gray-300 border-gray-600"}`}>
                          {p.priorityTier}
                        </span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || "bg-gray-700 text-gray-300"}`}>
                          {p.status.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.connectiqScore != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${p.connectiqScore >= 70 ? "bg-red-500" : p.connectiqScore >= 45 ? "bg-orange-500" : "bg-gray-500"}`}
                              style={{ width: `${p.connectiqScore}%` }} />
                          </div>
                          <span className="text-white text-xs font-bold">{p.connectiqScore}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {(p.status === "NEW") && (
                          <button onClick={() => research(p.id)} disabled={researchingId === p.id}
                            className="text-xs bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white px-2 py-1 rounded transition-colors flex items-center gap-1">
                            {researchingId === p.id ? <><Spinner size={12} />…</> : "Research"}
                          </button>
                        )}
                        <button onClick={() => { setSelected(p); setActiveTab("EMAIL"); }}
                          className="text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 px-2 py-1 rounded transition-colors">
                          View
                        </button>
                        <button onClick={() => del(p.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                          <X size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="w-[620px] shrink-0 bg-gray-800 border border-gray-700 rounded-xl overflow-y-auto max-h-[calc(100vh-8rem)]">
          <div className="flex items-start justify-between p-5 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold text-white text-lg">{selected.companyName}</h2>
                {selected.priorityTier && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_STYLES[selected.priorityTier] || ""}`}>
                    {selected.priorityTier}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    {selected.website} <ExternalLink size={10} />
                  </a>
                )}
                {selected.linkedinUrl && (
                  <a href={selected.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline">LinkedIn</a>
                )}
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white ml-4 mt-0.5 shrink-0"><X size={18} /></button>
          </div>

          <div className="p-5 space-y-5">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {selected.employeeCount && (
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{selected.employeeCount.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Employees</div>
                </div>
              )}
              {selected.revenueEstimate && (
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-sm font-bold text-white">{selected.revenueEstimate}</div>
                  <div className="text-xs text-gray-400">Revenue</div>
                </div>
              )}
              {selected.aiAutomationScore != null && (
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">{selected.aiAutomationScore}/10</div>
                  <div className="text-xs text-gray-400">AI/Auto Score</div>
                </div>
              )}
            </div>

            {/* ConnectIQ Score breakdown */}
            {selected.connectiqScore != null && (
              <div className="bg-gray-700/30 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Target size={12} /> ConnectIQ Score
                  </h3>
                  <span className={`text-2xl font-bold ${selected.connectiqScore >= 70 ? "text-red-400" : selected.connectiqScore >= 45 ? "text-orange-400" : "text-gray-400"}`}>
                    {selected.connectiqScore}
                  </span>
                </div>
                <div className="space-y-2.5">
                  <ScoreBar label="Growth Signals" value={selected.growthSignalsScore} max={25} color="bg-green-500" />
                  <ScoreBar label="Technology Need" value={selected.technologyScore} max={25} color="bg-blue-500" />
                  <ScoreBar label="Revenue Potential" value={selected.revenuePotentialScore} max={20} color="bg-purple-500" />
                  <ScoreBar label="Company Size Fit" value={selected.companySizeFitScore} max={15} color="bg-teal-500" />
                  <ScoreBar label="Trigger Events" value={selected.triggerEventsScore} max={15} color="bg-orange-500" />
                </div>
                {selected.estimatedPipelineValue && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-400">Estimated Pipeline: </span>
                    <span className="text-sm font-semibold text-green-400">{selected.estimatedPipelineValue}</span>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            {selected.companySummary && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Company Summary</h3>
                <p className="text-gray-300 text-sm">{selected.companySummary}</p>
              </div>
            )}

            {/* Technology Need */}
            {selected.technologyNeed && (
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <AlertCircle size={11} /> Technology Need
                </h3>
                <p className="text-blue-200 text-sm">{selected.technologyNeed}</p>
              </div>
            )}

            {/* Fit Reason */}
            {selected.fitReason && selected.fitReason !== selected.companySummary && (
              <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">Fit Reason</h3>
                <p className="text-purple-200 text-sm">{selected.fitReason}</p>
              </div>
            )}

            {/* Key Decision Makers */}
            {selected.keyDecisionMakers && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Key Decision Makers</h3>
                <p className="text-gray-300 text-sm">{selected.keyDecisionMakers}</p>
              </div>
            )}

            {/* Recommended Conversation */}
            {selected.recommendedConversation && selected.recommendedConversation !== selected.fitReason && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recommended Conversation Angle</h3>
                <p className="text-gray-300 text-sm italic">{selected.recommendedConversation}</p>
              </div>
            )}

            {/* Business Signals */}
            {selected.businessSignals.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <TrendingUp size={12} /> Business Signals & Trigger Events
                </h3>
                <div className="space-y-2">
                  {selected.businessSignals.map((s) => (
                    <div key={s.id} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-sm font-medium text-white mb-0.5">{s.title}</div>
                      {s.description && <p className="text-xs text-gray-400">{s.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source info */}
            {selected.sourceCompany && (
              <div className="text-xs text-gray-500">
                Discovered via ICP analysis of <span className="text-gray-400">{selected.sourceCompany}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {(selected.status === "NEW" || selected.status === "RESEARCHED") && (
                <button onClick={() => research(selected.id)} disabled={researchingId === selected.id}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                  {researchingId === selected.id ? <><Spinner size={14} />Researching…</> : "Deep Research"}
                </button>
              )}
              {(selected.status === "SCORED" || selected.status === "RESEARCHED" || selected.status === "NEW") && (
                <button onClick={() => generateOutreach(selected.id)} disabled={outreachingId === selected.id}
                  className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                  {outreachingId === selected.id ? <><Spinner size={14} />Generating…</> : "Generate Outreach"}
                </button>
              )}
              {selected.status !== "IN_CRM" && selected.fitScore !== null && (
                <button onClick={() => syncHubspot(selected.id)} disabled={hubspotingId === selected.id}
                  className="flex items-center gap-1.5 bg-orange-700 hover:bg-orange-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                  {hubspotingId === selected.id ? <><Spinner size={14} />Syncing…</> : "Sync to HubSpot"}
                </button>
              )}
            </div>

            {/* Outreach Drafts */}
            {selected.outreachDrafts.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Outreach Variations</h3>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {OUTREACH_TABS.map(({ key, label }) => {
                    const hasDraft = selected.outreachDrafts.some((d) => d.type === key);
                    return (
                      <button key={key} onClick={() => setActiveTab(key)} disabled={!hasDraft}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30 ${activeTab === key ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400 hover:text-white"}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
                {activeDraft && (
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    {activeDraft.subject && (
                      <div className="mb-3 pb-3 border-b border-gray-700">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Subject: </span>
                        <span className="text-sm text-white font-medium">{activeDraft.subject}</span>
                      </div>
                    )}
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{activeDraft.body}</pre>
                    <button onClick={() => copy(activeDraft.subject ? `Subject: ${activeDraft.subject}\n\n${activeDraft.body}` : activeDraft.body)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                      {copied ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Discover Modal */}
      {showDiscoverModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Zap size={18} className="text-purple-400" /> ICP Discovery</h2>
                <p className="text-xs text-gray-400 mt-0.5">Enter a target company and AI will find similar prospects.</p>
              </div>
              <button onClick={() => { setShowDiscoverModal(false); setDiscoverResult(null); }} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Target Company *</label>
                <input type="text" value={discoverForm.targetCompany}
                  onChange={(e) => setDiscoverForm((f) => ({ ...f, targetCompany: e.target.value }))}
                  placeholder="e.g. Acme Construction Co."
                  className={inputCls} />
                <p className="text-xs text-gray-500 mt-1">AI analyzes this company and finds 25-50 similar prospects with the same ICP.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Prospect Count</label>
                  <select value={discoverForm.count} onChange={(e) => setDiscoverForm((f) => ({ ...f, count: e.target.value }))} className={inputCls}>
                    {["10", "15", "25", "35", "50"].map((n) => <option key={n} value={n}>{n} companies</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Assign to ICP</label>
                  <select value={discoverForm.icpId} onChange={(e) => setDiscoverForm((f) => ({ ...f, icpId: e.target.value }))} className={inputCls}>
                    <option value="">None</option>
                    {icps.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>

              {discoverResult && (
                <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
                  <p className="text-green-300 font-medium text-sm mb-2">✓ Discovered {discoverResult.count} prospects</p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-red-400">🔥 {discoverResult.hot} HOT</span>
                    <span className="text-orange-400">🌡 {discoverResult.warm} WARM</span>
                    <span className="text-gray-400">⏳ {discoverResult.future} FUTURE</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-700">
              {!discoverResult ? (
                <>
                  <button onClick={runDiscover} disabled={discovering || !discoverForm.targetCompany.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                    {discovering ? <><Spinner size={14} />Discovering…</> : <><Zap size={14} />Run Discovery</>}
                  </button>
                  <button onClick={() => setShowDiscoverModal(false)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 transition-colors">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => { setShowDiscoverModal(false); setDiscoverResult(null); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  View Prospects →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Prospect Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Add Prospect Manually</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {(["companyName", "website", "industry", "location"] as const).map((field) => (
                <div key={field}>
                  <label className={labelCls}>
                    {field === "companyName" ? "Company Name *" : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input type="text" value={addForm[field]} onChange={(e) => setAddForm((f) => ({ ...f, [field]: e.target.value }))}
                    className={inputCls} />
                </div>
              ))}
              <div>
                <label className={labelCls}>Employee Count</label>
                <input type="number" value={addForm.employeeCount} onChange={(e) => setAddForm((f) => ({ ...f, employeeCount: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Assign to ICP</label>
                <select value={addForm.icpId} onChange={(e) => setAddForm((f) => ({ ...f, icpId: e.target.value }))} className={inputCls}>
                  <option value="">None</option>
                  {icps.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-700">
              <button onClick={addProspect} disabled={adding || !addForm.companyName}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                {adding && <Spinner size={14} />}{adding ? "Adding…" : "Add Prospect"}
              </button>
              <button onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500";
const labelCls = "block text-sm font-medium text-gray-300 mb-1";
