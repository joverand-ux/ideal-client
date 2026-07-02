"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { InternalDetails } from "@/lib/localStorage";

interface InternalDetailsModalProps {
  open: boolean;
  initialValues?: InternalDetails;
  onClose: () => void;
  onSubmit: (details: InternalDetails) => void;
}

const FIELDS: Array<{ key: keyof InternalDetails; label: string; placeholder: string }> = [
  { key: "teamSize", label: "Team size", placeholder: "e.g. 8 employees" },
  { key: "monthlyLeadVolume", label: "Monthly lead / inquiry volume", placeholder: "e.g. ~120 per month" },
  { key: "currentTools", label: "Current tools (CRM, support desk, etc.)", placeholder: "e.g. HubSpot, Gmail, spreadsheets" },
  { key: "biggestBottleneck", label: "Biggest day-to-day bottleneck", placeholder: "e.g. following up with leads fast enough" },
  { key: "budgetRange", label: "Rough budget range for AI initiatives", placeholder: "e.g. $2k-5k/month" },
];

export function InternalDetailsModal({ open, initialValues, onClose, onSubmit }: InternalDetailsModalProps) {
  const [values, setValues] = useState<InternalDetails>(initialValues ?? {});
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset the form values whenever the modal transitions from closed to open.
  // Adjusted during render (React's recommended pattern) rather than in an
  // effect, since the component stays mounted across open/close toggles.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setValues(initialValues ?? {});
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add Internal Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              A few quick questions to sharpen the recommendations. Everything here is optional.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}</label>
              <input
                type="text"
                value={values[field.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
            >
              Save & Refresh Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
