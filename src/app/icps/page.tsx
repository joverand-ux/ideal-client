"use client";
import { useState, useEffect } from "react";
import { Plus, X, Users, MapPin } from "lucide-react";
import { TagInput } from "@/components/tag-input";
import { Spinner } from "@/components/spinner";

interface ICP {
  id: string;
  name: string;
  industries: string[];
  geography: string[];
  minEmployees: number | null;
  maxEmployees: number | null;
  minYearsInBusiness: number | null;
  keywords: string[];
  exclusions: string[];
}

const emptyForm = (): Omit<ICP, "id"> => ({
  name: "",
  industries: [],
  geography: [],
  minEmployees: null,
  maxEmployees: null,
  minYearsInBusiness: null,
  keywords: [],
  exclusions: [],
});

export default function ICPsPage() {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ICP | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [profileRes, icpRes] = await Promise.all([fetch("/api/profile"), fetch("/api/icps")]);
    const profile = await profileRes.json();
    const icpData = await icpRes.json();
    setProfileId(profile?.id ?? null);
    setIcps(Array.isArray(icpData) ? icpData : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowModal(true); };
  const openEdit = (icp: ICP) => { setEditing(icp); setForm({ name: icp.name, industries: icp.industries, geography: icp.geography, minEmployees: icp.minEmployees, maxEmployees: icp.maxEmployees, minYearsInBusiness: icp.minYearsInBusiness, keywords: icp.keywords, exclusions: icp.exclusions }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const set = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.name || !profileId) return;
    setSaving(true);
    const url = editing ? `/api/icps/${editing.id}` : "/api/icps";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, clientProfileId: profileId }),
    });
    await load();
    setSaving(false);
    closeModal();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this ICP?")) return;
    await fetch(`/api/icps/${id}`, { method: "DELETE" });
    setIcps((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Spinner /><span>Loading…</span></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Ideal Client Profiles</h1>
          <p className="text-gray-400 text-sm mt-1">Define the types of companies you want to reach.</p>
        </div>
        {profileId && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Create ICP
          </button>
        )}
      </div>

      {!profileId && (
        <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg text-sm mb-6">
          Please complete your <a href="/profile" className="underline font-medium">Client Profile</a> first.
        </div>
      )}

      {icps.length === 0 && profileId && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No ICPs yet.</p>
          <p className="text-sm mt-1">Create your first Ideal Client Profile to start finding prospects.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {icps.map((icp) => (
          <div key={icp.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors cursor-pointer" onClick={() => openEdit(icp)}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-white">{icp.name}</h3>
              <button onClick={(e) => { e.stopPropagation(); del(icp.id); }} className="text-gray-500 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
            {icp.industries.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {icp.industries.slice(0, 3).map((ind) => (
                  <span key={ind} className="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded-full">{ind}</span>
                ))}
                {icp.industries.length > 3 && <span className="text-gray-500 text-xs">+{icp.industries.length - 3}</span>}
              </div>
            )}
            <div className="space-y-1 text-xs text-gray-400">
              {icp.geography.length > 0 && (
                <div className="flex items-center gap-1"><MapPin size={11} />{icp.geography.slice(0, 2).join(", ")}</div>
              )}
              {(icp.minEmployees || icp.maxEmployees) && (
                <div className="flex items-center gap-1"><Users size={11} />
                  {icp.minEmployees ?? "Any"}–{icp.maxEmployees ?? "Any"} employees
                </div>
              )}
              {icp.keywords.length > 0 && <div>{icp.keywords.length} keyword{icp.keywords.length !== 1 ? "s" : ""}</div>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">{editing ? "Edit ICP" : "Create ICP"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Name *">
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                  className={inputCls} placeholder="e.g. Mid-size Construction Firms" />
              </Field>
              <Field label="Industries">
                <TagInput value={form.industries} onChange={(v) => set("industries", v)} placeholder="e.g. Construction" />
              </Field>
              <Field label="Geography">
                <TagInput value={form.geography} onChange={(v) => set("geography", v)} placeholder="e.g. Pennsylvania" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Min Employees">
                  <input type="number" value={form.minEmployees ?? ""} onChange={(e) => set("minEmployees", e.target.value ? Number(e.target.value) : null)}
                    className={inputCls} placeholder="15" />
                </Field>
                <Field label="Max Employees">
                  <input type="number" value={form.maxEmployees ?? ""} onChange={(e) => set("maxEmployees", e.target.value ? Number(e.target.value) : null)}
                    className={inputCls} placeholder="500" />
                </Field>
              </div>
              <Field label="Min Years in Business">
                <input type="number" value={form.minYearsInBusiness ?? ""} onChange={(e) => set("minYearsInBusiness", e.target.value ? Number(e.target.value) : null)}
                  className={inputCls} placeholder="5" />
              </Field>
              <Field label="Keywords">
                <TagInput value={form.keywords} onChange={(v) => set("keywords", v)} placeholder="e.g. Infrastructure, Municipal" />
              </Field>
              <Field label="Exclusions">
                <TagInput value={form.exclusions} onChange={(v) => set("exclusions", v)} placeholder="e.g. Residential only" />
              </Field>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-700">
              <button onClick={save} disabled={saving || !form.name}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                {saving && <Spinner size={14} />}{saving ? "Saving…" : "Save"}
              </button>
              <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 transition-colors">
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
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>{children}</div>;
}
