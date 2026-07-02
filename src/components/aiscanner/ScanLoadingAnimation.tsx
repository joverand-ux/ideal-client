"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  "Reading website",
  "Detecting business model",
  "Finding workflow gaps",
  "Generating AI opportunities",
  "Building roadmap",
];

const STEP_DURATION_MS = 700;

export function ScanLoadingAnimation({ onComplete }: { onComplete: () => void }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (activeStep >= STEPS.length) {
      const timeout = setTimeout(onComplete, 300);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setActiveStep((s) => s + 1), STEP_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [activeStep, onComplete]);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Scanning your business…</h2>
        <p className="mt-1 text-sm text-slate-500">AIScanner is analyzing the website and building your report.</p>
      </div>
      <ul className="space-y-4">
        {STEPS.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                  done ? "bg-emerald-500 text-white" : active ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Check size={14} /> : active ? <Loader2 size={14} className="animate-spin" /> : i + 1}
              </span>
              <span className={`text-sm ${done || active ? "font-medium text-slate-800" : "text-slate-400"}`}>{step}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
