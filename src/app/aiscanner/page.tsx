import Link from "next/link";
import { Sparkles, ScanSearch, LineChart, ArrowRight } from "lucide-react";
import { UrlScanForm } from "@/components/aiscanner/UrlScanForm";

const FEATURES = [
  {
    icon: ScanSearch,
    title: "Website Intelligence",
    description: "AIScanner reads the site to infer industry, offerings, customer types, and digital maturity.",
  },
  {
    icon: Sparkles,
    title: "AI Opportunity Detection",
    description: "Surfaces specific, department-level automation opportunities — not generic advice.",
  },
  {
    icon: LineChart,
    title: "Actionable Roadmap",
    description: "A prioritized 30/60/90 day plan with ROI vs. effort, ready to walk a client through.",
  },
];

export default function AIScannerLandingPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-14 text-center sm:px-12 sm:py-20">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
          <Sparkles size={12} />
          AI Solution Architect
        </span>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Turn any company website into an AI opportunity roadmap
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          AIScanner analyzes a company&apos;s website and generates a credible, personalized AI opportunity report —
          readiness score, detected gaps, recommended solutions, and a 30/60/90 day plan.
        </p>

        <div className="mt-8 flex justify-center">
          <UrlScanForm variant="simple" />
        </div>

        <Link
          href="/aiscanner/dashboard"
          className="mt-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
        >
          View previous scans <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Icon size={18} />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
