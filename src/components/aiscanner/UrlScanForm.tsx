"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TagInput } from "@/components/tag-input";
import { normalizeAndValidateUrl } from "@/lib/utils";
import { createScanRequest, type ScanRequest } from "@/lib/localStorage";

const INDUSTRY_OPTIONS = [
  "Legal Services",
  "Real Estate & Finance",
  "Healthcare",
  "E-Commerce & Retail",
  "General Professional Services",
  "Not sure / Other",
];

interface UrlScanFormProps {
  variant?: "simple" | "full";
  initialUrl?: string;
}

export function UrlScanForm({ variant = "full", initialUrl = "" }: UrlScanFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = normalizeAndValidateUrl(url);
    if (!result.valid || !result.normalized) {
      setError(result.error ?? "Please enter a valid website URL.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const request: ScanRequest = {
      id: crypto.randomUUID(),
      url: result.normalized,
      companyName: companyName.trim() || undefined,
      industry: industry && industry !== "Not sure / Other" ? industry : undefined,
      competitors: competitors.length > 0 ? competitors.join(", ") : undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    createScanRequest(request);
    router.push(`/aiscanner/report/${request.id}`);
  };

  const handleAddDetails = () => {
    const params = url.trim() ? `?url=${encodeURIComponent(url.trim())}` : "";
    router.push(`/aiscanner/scan${params}`);
  };

  if (variant === "simple") {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourcompany.com"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="whitespace-nowrap rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
          >
            Scan My Business
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={handleAddDetails}
          className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
        >
          + Add Business Details
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      <Field label="Website URL" required>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourcompany.com"
          className={inputCls}
        />
      </Field>
      <Field label="Company Name">
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Company"
          className={inputCls}
        />
      </Field>
      <Field label="Industry">
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCls}>
          <option value="">Select an industry…</option>
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Competitors">
        <TagInput value={competitors} onChange={setCompetitors} placeholder="Type a competitor and press Enter" />
      </Field>
      <Field label="Notes about business pain points">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. We lose leads after hours, our team spends too much time on manual quotes…"
          className={`${inputCls} resize-none`}
        />
      </Field>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60 sm:w-auto"
      >
        Scan My Business
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      {children}
    </div>
  );
}
