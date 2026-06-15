"use client";
import { useState, useEffect } from "react";
import { TagInput } from "@/components/tag-input";

interface Profile {
  companyName: string;
  website: string;
  servicesOffered: string[];
  valueProposition: string;
  targetIndustries: string[];
  geography: string[];
  competitiveAdvantages: string[];
}

const empty: Profile = {
  companyName: "",
  website: "",
  servicesOffered: [],
  valueProposition: "",
  targetIndustries: [],
  geography: [],
  competitiveAdvantages: [],
};

export default function ProfilePage() {
  const [form, setForm] = useState<Profile>(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { if (d) setForm({ ...empty, ...d }); })
      .catch(() => {});
  }, []);

  const set = (key: keyof Profile, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      setMsg({ type: "success", text: "Profile saved successfully." });
    } catch {
      setMsg({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Client Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Tell ConnectIQ about your company so it can find the right prospects.</p>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-5">
        <Field label="Company Name">
          <input type="text" value={form.companyName} onChange={(e) => set("companyName", e.target.value)}
            className={inputCls} placeholder="Acme Engineering" />
        </Field>
        <Field label="Website">
          <input type="text" value={form.website} onChange={(e) => set("website", e.target.value)}
            className={inputCls} placeholder="https://acme.com" />
        </Field>
        <Field label="Services Offered">
          <TagInput value={form.servicesOffered} onChange={(v) => set("servicesOffered", v)} placeholder="Type a service and press Enter" />
        </Field>
        <Field label="Value Proposition">
          <textarea value={form.valueProposition} onChange={(e) => set("valueProposition", e.target.value)}
            rows={3} className={`${inputCls} resize-none`} placeholder="What makes your company unique?" />
        </Field>
        <Field label="Target Industries">
          <TagInput value={form.targetIndustries} onChange={(v) => set("targetIndustries", v)} placeholder="e.g. Construction, Healthcare" />
        </Field>
        <Field label="Geography">
          <TagInput value={form.geography} onChange={(v) => set("geography", v)} placeholder="e.g. Pennsylvania, New York" />
        </Field>
        <Field label="Competitive Advantages">
          <TagInput value={form.competitiveAdvantages} onChange={(v) => set("competitiveAdvantages", v)} placeholder="e.g. 20 years experience" />
        </Field>
        <div className="pt-2">
          <button onClick={save} disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  );
}
