"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Building2,
  Target,
  Sparkles,
  Scale,
  Clock,
  Layers,
  Map as MapIcon,
  HelpCircle,
  Rocket,
  Radar,
  Settings2,
} from "lucide-react";

import {
  getScanById,
  saveScanResults,
  updateScanStatus,
  updateInternalDetails,
  type StoredScan,
  type ScanStatus,
  type InternalDetails,
} from "@/lib/localStorage";
import { analyzeWebsite } from "@/lib/mockWebsiteAnalyzer";
import { generateReport } from "@/lib/reportGenerator";

import { ScanSummaryCard } from "@/components/aiscanner/ScanSummaryCard";
import { ReadinessScore } from "@/components/aiscanner/ReadinessScore";
import { ReportSection } from "@/components/aiscanner/ReportSection";
import { OpportunityCard } from "@/components/aiscanner/OpportunityCard";
import { RoiEffortMatrix } from "@/components/aiscanner/RoiEffortMatrix";
import { RoadmapTimeline } from "@/components/aiscanner/RoadmapTimeline";
import { ValidationQuestions } from "@/components/aiscanner/ValidationQuestions";
import { ScanLoadingAnimation } from "@/components/aiscanner/ScanLoadingAnimation";
import { InternalDetailsModal } from "@/components/aiscanner/InternalDetailsModal";

const STATUS_OPTIONS: ScanStatus[] = ["New", "In Review", "Sent to Client", "Archived"];

export default function AIScannerReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [scan, setScan] = useState<StoredScan | null | undefined>(undefined);
  const [generating, setGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Deferred to a microtask: localStorage reads are synchronous, but this
    // keeps the pattern consistent with "subscribe/fetch then setState in a
    // callback" rather than setting state synchronously in the effect body.
    Promise.resolve().then(() => {
      if (cancelled) return;
      const existing = getScanById(id);
      if (!existing) {
        setScan(null);
        return;
      }
      setScan(existing);
      if (!existing.report || !existing.analysis) {
        setGenerating(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAnimationComplete = () => {
    const existing = getScanById(id);
    if (!existing) {
      setGenerating(false);
      return;
    }
    const analysis = analyzeWebsite({
      url: existing.request.url,
      companyName: existing.request.companyName,
      industry: existing.request.industry,
      competitors: existing.request.competitors,
      notes: existing.request.notes,
    });
    const report = generateReport(
      id,
      analysis,
      { industry: existing.request.industry, notes: existing.request.notes },
      existing.request.internalDetails
    );
    const updated = saveScanResults(id, analysis, report);
    setScan(updated ?? existing);
    setGenerating(false);
  };

  const handleStatusChange = (status: ScanStatus) => {
    if (!scan) return;
    updateScanStatus(scan.id, status);
    setScan({ ...scan, status });
  };

  const handleInternalDetailsSubmit = (details: InternalDetails) => {
    if (!scan || !scan.analysis) return;
    const updatedScanRequest = updateInternalDetails(scan.id, details);
    const report = generateReport(
      scan.id,
      scan.analysis,
      { industry: scan.request.industry, notes: scan.request.notes },
      details
    );
    const updated = saveScanResults(scan.id, scan.analysis, report);
    setScan(updated ?? updatedScanRequest ?? scan);
    setModalOpen(false);
  };

  if (scan === undefined) {
    return <div className="py-20 text-center text-slate-500">Loading scan…</div>;
  }

  if (scan === null) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-lg font-medium text-white">Scan not found</p>
        <p className="mt-1 text-sm text-slate-400">This scan may have been cleared from local storage.</p>
        <Link href="/aiscanner" className="mt-4 inline-block text-sm font-medium text-blue-400 hover:underline">
          Start a new scan
        </Link>
      </div>
    );
  }

  if (generating || !scan.analysis || !scan.report) {
    return (
      <div className="py-10">
        <ScanLoadingAnimation onComplete={handleAnimationComplete} />
      </div>
    );
  }

  const { analysis, report } = scan;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/aiscanner/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={14} /> All Scans
      </Link>

      <ScanSummaryCard request={scan.request} analysis={analysis} status={scan.status} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Settings2 size={14} />
          Status:
          <select
            value={scan.status}
            onChange={(e) => handleStatusChange(e.target.value as ScanStatus)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="text-sm font-medium text-blue-500 hover:text-blue-600 hover:underline"
        >
          + Add Internal Details
        </button>
      </div>

      <ReportSection title="AIScanner Readiness Score">
        <ReadinessScore score={report.readinessScore} />
      </ReportSection>

      <ReportSection
        title="Website Intelligence Summary"
        icon={Globe}
        description="What AIScanner detected from the website itself"
      >
        <p className="mb-5 text-sm leading-relaxed text-slate-600">{report.websiteIntelligenceSummary}</p>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Radar size={13} /> Website Signals Detected
          </p>
          <div className="flex flex-wrap gap-2">
            {report.websiteSignalsDetected.map((signal) => (
              <span key={signal} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {signal}
              </span>
            ))}
          </div>
        </div>
      </ReportSection>

      <ReportSection title="Business Model Hypothesis" icon={Building2}>
        <p className="text-sm leading-relaxed text-slate-600">{report.businessModelHypothesis}</p>
      </ReportSection>

      <ReportSection title="Detected AI Opportunity Areas" icon={Target}>
        <div className="flex flex-wrap gap-2">
          {report.detectedOpportunityAreas.map((area) => (
            <span key={area} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
              {area}
            </span>
          ))}
        </div>
      </ReportSection>

      <ReportSection
        title="Top 5 AI Recommendations"
        icon={Sparkles}
        description="Ranked by fit for this business, based on detected gaps"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {report.recommendations.map((rec, i) => (
            <OpportunityCard key={rec.id} recommendation={rec} rank={i + 1} />
          ))}
        </div>
      </ReportSection>

      <ReportSection title="ROI / Effort Matrix" icon={Scale} description="Where to focus first">
        <RoiEffortMatrix recommendations={report.recommendations} />
      </ReportSection>

      <div className="grid gap-6 sm:grid-cols-2">
        <ReportSection title="Estimated Time Savings" icon={Clock}>
          <p className="text-2xl font-bold text-slate-900">{report.estimatedTimeSavings}</p>
        </ReportSection>
        <ReportSection title="Suggested AI Stack" icon={Layers}>
          <ul className="space-y-2">
            {report.suggestedAiStack.map((tool) => (
              <li key={tool} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                {tool}
              </li>
            ))}
          </ul>
        </ReportSection>
      </div>

      <ReportSection title="30/60/90 Day Roadmap" icon={MapIcon}>
        <RoadmapTimeline roadmap={report.roadmap} />
      </ReportSection>

      <ReportSection title="Questions to Validate With the Client" icon={HelpCircle}>
        <ValidationQuestions questions={report.validationQuestions} />
      </ReportSection>

      <ReportSection title="Recommended Next Step" icon={Rocket} className="border-blue-200 bg-blue-50/40">
        <p className="text-sm font-medium leading-relaxed text-slate-800">{report.recommendedNextStep}</p>
      </ReportSection>

      <InternalDetailsModal
        open={modalOpen}
        initialValues={scan.request.internalDetails}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInternalDetailsSubmit}
      />
    </div>
  );
}
