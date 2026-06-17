"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, X, Search, ExternalLink, Copy, Check } from "lucide-react";
import { Spinner } from "@/components/spinner";

interface Signal { id: string; type: string; title: string; description: string | null; source: string | null; }
interface Draft { id: string; type: string; subject: string | null; body: string; }
interface Prospect {
  id: string; companyName: string; website: string | null; industry: string | null;
  location: string | null; employeeCount: number | null; status: string;
  fitScore: number | null; fitReason: string | null; confidenceScore: number | null;
  opportunityRating: string | null; recommendedConversation: string | null;
  companySummary: string | null; services: string[]; marketsServed: string[];
  locations: string[]; leadershipInfo: string | null;
  businessSignals: Signal[]; outreachDrafts: Draft[];
  icpId: string | null;
}
interface ICP { id: string; name: string; }

interface AgentDraftPayload {
  reasoning: string;
  outreachType: string;
  messageBody: string;
}

function parseAgentDraft(body: string): AgentDraftPayload | null {
  try {
    return JSON.parse(body) as AgentDraftPayload;
  } catch {
    return null;
  }
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-600",
  RESEARCHING: "bg-yellow-50 text-yellow-700",
  RESEARCHED: "bg-blue-50 text-blue-700",
  SCORED: "bg-purple-50 text-purple-700",
  OUTREACH_READY: "bg-green-50 text-green-700",
  IN_CRM: "bg-teal-50 text-teal-700",
  ARCHIVED: "bg-red-50 text-red-700",
};

const OPP_COLORS: Record<string, string> = { HIGH: "text-green-600", MEDIUM: "text-yellow-600", LOW: "text-gray-500" };

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [icps, setIcps] = useState<ICP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [researchingId, setResearchingId] = useState<string | null>(null);
  const [outreachingId, setOutreachingId] = useState<string | null>(null);
  const [agentingId, setAgentingId] = useState<string | null>(null);
  const [hubspotingId, setHubspotingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("EMAIL");
  const [copied, setCopied] = useState(false);
  const [addForm, setAddForm] = useState({ companyName: "", website: "", industry: "", location: "", employeeCount: "", icpId: "" });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const [pRes, iRes] = await Promise.all([fetch("/api/prospects"), fetch("/api/icps")]);
    const pData = await pRes.json();
    const iData = await iRes.json();
    setProspects(Array.isArray(pData) ? pData : []);
    setIcps(Array.isArray(iData) ? iData : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = prospects.filter((p) => {
    const matchSearch = p.companyName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
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
      await load();
      if (selected?.id === id) {
        const fresh = await fetch(`/api/prospects/${id}`).then((res) => res.json()) as Prospect;
        setSelected(fresh);
      }
    }
    setOutreachingId(null);
    setActiveTab("EMAIL");
  };

  const runAgent = async (id: string) => {
    setAgentingId(id);
    const r = await fetch(`/api/prospects/${id}/agent-outreach`, { method: "POST" });
    if (r.ok) {
      await load();
      if (selected?.id === id) {
        const fresh = await fetch(`/api/prospects/${id}`).then((res) => res.json()) as Prospect;
        setSelected(fresh);
        setActiveTab("AGENT");
      }
    }
    setAgentingId(null);
  };

  const syncHubspot = async (id: string) => {
    setHubspotingId(id);
    const r = await fetch(`/api/prospects/${id}/hubspot`, { method: "POST" });
    if (r.ok) {
      await load();
      if (selected?.id === id) {
        const fresh = await fetch(`/api/prospects/${id}`).then((res) => res.json()) as Prospect;
        setSelected(fresh);
      }
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

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const activeDraft = selected?.outreachDrafts?.find((d) => d.type === activeTab);
  const agentDraft = selected?.outreachDrafts?.find((d) => d.type === "AGENT");
  const agentPayload = agentDraft ? parseAgentDraft(agentDraft.body) : null;

  if (loading) return <div className="flex items-center gap-2 text-gray-500"><Spinner /><span>Loading…</span></div>;

  return (
    <div className="flex gap-6 h-full">
      {/* Main panel */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prospects <span className="text-sm font-normal text-gray-500 ml-2">{prospects.length} total</span></h1>
            <p className="text-gray-500 text-sm mt-1">Research and engage your ideal prospects.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Add Prospect
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search prospects…"
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-gray-900 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm outline-none focus:border-indigo-500">
            {["ALL", "NEW", "RESEARCHING", "RESEARCHED", "SCORED", "OUTREACH_READY", "IN_CRM", "ARCHIVED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No prospects found.</p>
            <p className="text-sm mt-1">Add your first prospect to get started.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wide bg-gray-50">
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Industry</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Fit Score</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setSelected(p); setActiveTab("EMAIL"); }}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.companyName}</div>
                      {p.website && <div className="text-xs text-gray-400 truncate max-w-[200px]">{p.website}</div>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">{p.industry || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {p.fitScore !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.fitScore}%` }} />
                          </div>
                          <span className="text-gray-700 text-xs">{p.fitScore}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {(p.status === "NEW" || p.status === "RESEARCHED") && (
                          <button onClick={() => research(p.id)} disabled={researchingId === p.id}
                            className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-2 py-1 rounded transition-colors flex items-center gap-1">
                            {researchingId === p.id ? <><Spinner size={12} />Researching…</> : "Research"}
                          </button>
                        )}
                        <button onClick={() => { setSelected(p); setActiveTab("EMAIL"); }}
                          className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-2 py-1 rounded transition-colors">
                          View
                        </button>
                        <button onClick={() => del(p.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
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
        <div className="w-[600px] shrink-0 bg-white border border-gray-200 rounded-xl overflow-y-auto max-h-[calc(100vh-8rem)] shadow-sm">
          <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">{selected.companyName}</h2>
              {selected.website && (
                <a href={selected.website} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-0.5">
                  {selected.website} <ExternalLink size={10} />
                </a>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 ml-4 mt-0.5"><X size={18} /></button>
          </div>

          <div className="p-5 space-y-5">
            {/* Meta */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[selected.status]}`}>{selected.status.replace("_", " ")}</span>
              {selected.opportunityRating && <span className={`text-xs font-medium ${OPP_COLORS[selected.opportunityRating]}`}>{selected.opportunityRating} opportunity</span>}
              {selected.fitScore !== null && <span className="text-xs text-gray-500">Fit Score: <span className="text-gray-900 font-medium">{selected.fitScore}/100</span></span>}
            </div>

            {/* Summary */}
            {selected.companySummary && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Company Summary</h3>
                <p className="text-gray-700 text-sm">{selected.companySummary}</p>
              </div>
            )}

            {/* Fit Reason */}
            {selected.fitReason && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Fit Reason</h3>
                <p className="text-blue-800 text-sm">{selected.fitReason}</p>
              </div>
            )}

            {/* Recommended Conversation */}
            {selected.recommendedConversation && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recommended Conversation</h3>
                <p className="text-gray-600 text-sm italic">{selected.recommendedConversation}</p>
              </div>
            )}

            {/* Business Signals */}
            {selected.businessSignals.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Business Signals</h3>
                <div className="space-y-2">
                  {selected.businessSignals.map((s) => (
                    <div key={s.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{s.type}</span>
                        <span className="text-sm font-medium text-gray-900">{s.title}</span>
                      </div>
                      {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {(selected.status === "NEW" || selected.status === "RESEARCHED" || selected.status === "SCORED") && (
                <button onClick={() => research(selected.id)} disabled={researchingId === selected.id}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                  {researchingId === selected.id ? <><Spinner size={14} />Researching…</> : "Run Research"}
                </button>
              )}
              {(selected.status === "SCORED" || selected.status === "RESEARCHED") && (
                <button onClick={() => generateOutreach(selected.id)} disabled={outreachingId === selected.id}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                  {outreachingId === selected.id ? <><Spinner size={14} />Generating…</> : "Generate Outreach"}
                </button>
              )}
              <button onClick={() => runAgent(selected.id)} disabled={agentingId === selected.id}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                {agentingId === selected.id ? <><Spinner size={14} />Agent thinking…</> : "Run Agent"}
              </button>
              {selected.status !== "IN_CRM" && selected.fitScore !== null && (
                <button onClick={() => syncHubspot(selected.id)} disabled={hubspotingId === selected.id}
                  className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                  {hubspotingId === selected.id ? <><Spinner size={14} />Syncing…</> : "Sync to HubSpot"}
                </button>
              )}
            </div>

            {/* Outreach Drafts */}
            {selected.outreachDrafts.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Outreach Drafts</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["EMAIL", "LINKEDIN", "CALL_SCRIPT", "MEETING_BRIEF"].map((tab) => {
                    const hasDraft = selected.outreachDrafts.some((d) => d.type === tab);
                    return (
                      <button key={tab} onClick={() => setActiveTab(tab)} disabled={!hasDraft}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200"}`}>
                        {tab.replace("_", " ")}
                      </button>
                    );
                  })}
                  {agentDraft && (
                    <button onClick={() => setActiveTab("AGENT")}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${activeTab === "AGENT" ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-600 hover:bg-violet-100"}`}>
                      Agent
                    </button>
                  )}
                </div>

                {/* Agent tab content */}
                {activeTab === "AGENT" && agentDraft && agentPayload && (
                  <div className="space-y-3">
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">Agent Reasoning</h4>
                      <p className="text-violet-800 text-sm">{agentPayload.reasoning}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Outreach type chosen:</span>
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                        {agentPayload.outreachType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      {agentDraft.subject && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Subject: </span>
                          <span className="text-sm text-gray-900 font-medium">{agentDraft.subject}</span>
                        </div>
                      )}
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{agentPayload.messageBody}</pre>
                      <button onClick={() => copy(agentDraft.subject ? `Subject: ${agentDraft.subject}\n\n${agentPayload.messageBody}` : agentPayload.messageBody)}
                        className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                        {copied ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Standard draft tab content */}
                {activeTab !== "AGENT" && activeDraft && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {activeDraft.subject && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Subject: </span>
                        <span className="text-sm text-gray-900 font-medium">{activeDraft.subject}</span>
                      </div>
                    )}
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{activeDraft.body}</pre>
                    <button onClick={() => copy(activeDraft.subject ? `Subject: ${activeDraft.subject}\n\n${activeDraft.body}` : activeDraft.body)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                      {copied ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Prospect Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add Prospect</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {(["companyName", "website", "industry", "location"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field === "companyName" ? "Company Name *" : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input type="text" value={addForm[field]} onChange={(e) => setAddForm((f) => ({ ...f, [field]: e.target.value }))}
                    className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
                <input type="number" value={addForm.employeeCount} onChange={(e) => setAddForm((f) => ({ ...f, employeeCount: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ICP</label>
                <select value={addForm.icpId} onChange={(e) => setAddForm((f) => ({ ...f, icpId: e.target.value }))} className={inputCls}>
                  <option value="">None</option>
                  {icps.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={addProspect} disabled={adding || !addForm.companyName}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                {adding && <Spinner size={14} />}{adding ? "Adding…" : "Add Prospect"}
              </button>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
