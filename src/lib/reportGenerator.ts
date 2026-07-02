import type { Industry, MaturityLevel, WebsiteAnalysis } from "./mockWebsiteAnalyzer";
import type { InternalDetails } from "./localStorage";

// TODO(ai-analysis): Replace this deterministic scoring/copy engine with a
// real LLM call (Claude/OpenAI, see src/lib/ai.ts) once real website content
// and internal details are available, so recommendations and copy are
// generated rather than templated.
// TODO(pdf-export): Wire this report shape into a PDF export pipeline
// (e.g. react-pdf or a server-rendered print stylesheet) for client delivery.
// TODO(crm-integration): Push generated reports/recommendations into the
// existing HubSpot integration (see src/app/api/prospects/[id]/hubspot) so
// AIScanner results can attach to a CRM record.

export type EffortLevel = "Low" | "Medium" | "High";
export type ConfidenceLevel = "Low" | "Medium" | "High";

export interface Recommendation {
  id: string;
  title: string;
  department: string;
  problem: string;
  aiSolution: string;
  estimatedImpact: string;
  implementationEffort: EffortLevel;
  confidenceLevel: ConfidenceLevel;
  whyDetected: string;
  roiScore: number;
  effortScore: number;
}

export interface RoadmapPhase {
  phase: "30 Days" | "60 Days" | "90 Days";
  focus: string;
  items: string[];
}

export interface AIOpportunityReport {
  scanId: string;
  generatedAt: string;
  readinessScore: number;
  scanConfidence: number;
  websiteIntelligenceSummary: string;
  businessModelHypothesis: string;
  detectedOpportunityAreas: string[];
  websiteSignalsDetected: string[];
  recommendations: Recommendation[];
  estimatedTimeSavings: string;
  suggestedAiStack: string[];
  roadmap: RoadmapPhase[];
  validationQuestions: string[];
  recommendedNextStep: string;
}

interface RecTemplate {
  key: string;
  title: string;
  department: string;
  driver: keyof Pick<WebsiteAnalysis, "leadCaptureQuality" | "supportMaturity" | "marketingMaturity" | "automationMaturity">;
  baseRoi: number;
  baseEffort: number;
  industryRelevance: Record<Industry, number>;
  problem: (companyName: string, industry: Industry) => string;
  aiSolution: (companyName: string, industry: Industry) => string;
  estimatedImpact: (companyName: string) => string;
  whyDetected: (analysis: WebsiteAnalysis) => string;
  stack: string;
}

const REC_TEMPLATES: RecTemplate[] = [
  {
    key: "chat-lead-qualification",
    title: "AI Website Chat / Lead Qualification Agent",
    department: "Sales & Marketing",
    driver: "leadCaptureQuality",
    baseRoi: 8,
    baseEffort: 3,
    industryRelevance: {
      "Legal Services": 3,
      "Real Estate & Finance": 3,
      Healthcare: 2,
      "E-Commerce & Retail": 3,
      "General Professional Services": 2,
    },
    problem: (companyName) =>
      `Visitors to ${companyName}'s website who have questions or are ready to engage likely leave without converting because there is no instant, always-on way to capture and qualify them.`,
    aiSolution: () =>
      "Deploy an AI chat agent on the website that engages visitors 24/7, answers common questions, and qualifies leads before routing them to the right person.",
    estimatedImpact: () => "15-30% increase in captured, qualified leads from existing traffic",
    whyDetected: (a) => `Detected because lead capture maturity was assessed as ${a.leadCaptureQuality} and no live chat or instant-response mechanism was found on the site.`,
    stack: "Conversational AI website agent (chat + lead qualification)",
  },
  {
    key: "faq-support-agent",
    title: "Automated FAQ / Support Agent",
    department: "Customer Support",
    driver: "supportMaturity",
    baseRoi: 6,
    baseEffort: 3,
    industryRelevance: {
      "Legal Services": 2,
      "Real Estate & Finance": 2,
      Healthcare: 3,
      "E-Commerce & Retail": 3,
      "General Professional Services": 2,
    },
    problem: (companyName) =>
      `Support staff at ${companyName} are likely answering the same handful of questions repeatedly by phone or email instead of higher-value work.`,
    aiSolution: () =>
      "Stand up an AI support agent trained on existing FAQ, policy, and service content to deflect repetitive questions and escalate only what needs a human.",
    estimatedImpact: () => "20-40% reduction in repetitive support volume",
    whyDetected: (a) => `Detected because support maturity was assessed as ${a.supportMaturity} and FAQ-style content was found spread across static pages rather than an interactive assistant.`,
    stack: "LLM-powered FAQ / support deflection agent",
  },
  {
    key: "proposal-quote-generator",
    title: "Proposal or Quote Generator",
    department: "Sales",
    driver: "automationMaturity",
    baseRoi: 7,
    baseEffort: 5,
    industryRelevance: {
      "Legal Services": 2,
      "Real Estate & Finance": 3,
      Healthcare: 1,
      "E-Commerce & Retail": 1,
      "General Professional Services": 3,
    },
    problem: (companyName) =>
      `Creating custom proposals, quotes, or estimates for new business at ${companyName} is likely a manual, time-intensive process that delays follow-up.`,
    aiSolution: () =>
      "Use an AI-assisted proposal/quote generator that pulls from templates and past engagements to draft a first version in minutes instead of hours.",
    estimatedImpact: () => "Cut proposal turnaround time from days to hours",
    whyDetected: (a) => `Detected because automation maturity was assessed as ${a.automationMaturity}, suggesting quote/proposal work is still handled manually.`,
    stack: "AI-assisted proposal / quote drafting tool",
  },
  {
    key: "crm-follow-up",
    title: "CRM Follow-Up Automation",
    department: "Sales & Marketing",
    driver: "automationMaturity",
    baseRoi: 7,
    baseEffort: 4,
    industryRelevance: {
      "Legal Services": 2,
      "Real Estate & Finance": 3,
      Healthcare: 2,
      "E-Commerce & Retail": 2,
      "General Professional Services": 3,
    },
    problem: (companyName) =>
      `Leads that don't convert immediately at ${companyName} likely go cold because there is no consistent, automated follow-up cadence in place.`,
    aiSolution: () =>
      "Implement CRM-connected automation that nurtures leads with personalized, AI-drafted follow-ups based on where they are in the pipeline.",
    estimatedImpact: () => "10-20% recovery rate on previously stalled leads",
    whyDetected: (a) => `Detected because automation maturity was assessed as ${a.automationMaturity} and no CRM-connected follow-up sequence was visible on the site.`,
    stack: "CRM workflow automation (e.g. HubSpot + AI follow-up sequencing)",
  },
  {
    key: "document-intake",
    title: "Document Intake and Classification",
    department: "Operations",
    driver: "automationMaturity",
    baseRoi: 6,
    baseEffort: 6,
    industryRelevance: {
      "Legal Services": 3,
      "Real Estate & Finance": 3,
      Healthcare: 3,
      "E-Commerce & Retail": 1,
      "General Professional Services": 2,
    },
    problem: (companyName) =>
      `Incoming documents (intake forms, contracts, records) at ${companyName} are likely handled manually, creating bottlenecks and data-entry errors.`,
    aiSolution: () =>
      "Introduce AI-powered document intake that classifies, extracts, and routes incoming documents automatically into the right workflow or system.",
    estimatedImpact: () => "Hours per week saved on manual document handling",
    whyDetected: (a) => `Detected because automation maturity was assessed as ${a.automationMaturity} and the business model involves document-heavy client intake.`,
    stack: "Document intake & classification pipeline (OCR + LLM extraction)",
  },
  {
    key: "review-reputation",
    title: "Review / Reputation Response Assistant",
    department: "Marketing",
    driver: "marketingMaturity",
    baseRoi: 5,
    baseEffort: 2,
    industryRelevance: {
      "Legal Services": 2,
      "Real Estate & Finance": 2,
      Healthcare: 3,
      "E-Commerce & Retail": 3,
      "General Professional Services": 2,
    },
    problem: (companyName) =>
      `Online reviews and reputation signals for ${companyName} are likely monitored and responded to inconsistently, if at all.`,
    aiSolution: () =>
      "Use an AI assistant to monitor new reviews across platforms and draft on-brand responses for quick approval, improving response time and consistency.",
    estimatedImpact: () => "Faster, more consistent review response and improved local reputation",
    whyDetected: (a) => `Detected because marketing maturity was assessed as ${a.marketingMaturity}, suggesting reputation management is not yet systematized.`,
    stack: "Review monitoring & AI response assistant",
  },
  {
    key: "executive-dashboard",
    title: "Executive KPI Dashboard",
    department: "Executive / Leadership",
    driver: "automationMaturity",
    baseRoi: 5,
    baseEffort: 5,
    industryRelevance: {
      "Legal Services": 1,
      "Real Estate & Finance": 2,
      Healthcare: 1,
      "E-Commerce & Retail": 2,
      "General Professional Services": 2,
    },
    problem: (companyName) =>
      `Leadership at ${companyName} likely lacks a single, real-time view into pipeline, response times, and operational KPIs across the business.`,
    aiSolution: () =>
      "Build an executive dashboard that aggregates key metrics (leads, response time, conversion, support volume) with AI-generated summaries and alerts.",
    estimatedImpact: () => "Faster, better-informed leadership decisions",
    whyDetected: () => "Recommended as a foundational layer so leadership can measure the impact of the other AI initiatives above.",
    stack: "Executive analytics / BI dashboard with AI-generated summaries",
  },
];

function maturityGapScore(level: MaturityLevel): number {
  if (level === "Low") return 3;
  if (level === "Medium") return 2;
  return 1;
}

function levelFromScore(score: number, thresholds: [number, number]): ConfidenceLevel {
  if (score >= thresholds[1]) return "High";
  if (score >= thresholds[0]) return "Medium";
  return "Low";
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildRecommendations(scanId: string, companyName: string, analysis: WebsiteAnalysis): Recommendation[] {
  const seed = hashString(scanId);

  const scored = REC_TEMPLATES.map((tpl, i) => {
    const gap = maturityGapScore(analysis[tpl.driver]);
    const relevance = tpl.industryRelevance[analysis.industryGuess];
    const jitter = (seed + i * 11) % 3;
    const score = gap * 2 + relevance + jitter;
    return { tpl, score, gap, jitter };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5);

  return top.map(({ tpl, gap, jitter }, index) => {
    const roiScore = Math.min(10, tpl.baseRoi + gap - 1);
    const effortScore = Math.max(1, Math.min(10, tpl.baseEffort + ((jitter + index) % 2)));
    const confidenceScore = analysis.scanConfidence / 10 + gap;
    return {
      id: tpl.key,
      title: tpl.title,
      department: tpl.department,
      problem: tpl.problem(companyName, analysis.industryGuess),
      aiSolution: tpl.aiSolution(companyName, analysis.industryGuess),
      estimatedImpact: tpl.estimatedImpact(companyName),
      implementationEffort: effortScore <= 3 ? "Low" : effortScore <= 6 ? "Medium" : "High",
      confidenceLevel: levelFromScore(confidenceScore, [7, 9]),
      whyDetected: tpl.whyDetected(analysis),
      roiScore,
      effortScore,
    };
  });
}

function buildRoadmap(recommendations: Recommendation[], companyName: string): RoadmapPhase[] {
  const sortedByEffort = [...recommendations].sort((a, b) => a.effortScore - b.effortScore);
  const [first, second, third, fourth, fifth] = sortedByEffort;

  return [
    {
      phase: "30 Days",
      focus: "Quick wins & validation",
      items: [
        `Validate findings with ${companyName} stakeholders and confirm priority use case`,
        first ? `Scope and prototype: ${first.title}` : "Scope highest-priority AI opportunity",
        "Audit existing tools/CRM to confirm integration points",
      ],
    },
    {
      phase: "60 Days",
      focus: "First deployment",
      items: [
        first ? `Deploy ${first.title} to production and measure impact` : "Deploy first AI initiative",
        second ? `Begin implementation: ${second.title}` : "Begin second AI initiative",
        "Establish baseline metrics for ROI tracking",
      ],
    },
    {
      phase: "90 Days",
      focus: "Scale & expand",
      items: [
        third ? `Roll out: ${third.title}` : "Expand automation coverage",
        [fourth, fifth].filter(Boolean).map((r) => r!.title).join(" and ") || "Layer in remaining recommendations",
        "Review results against Executive KPI Dashboard and plan next quarter's roadmap",
      ],
    },
  ];
}

function computeReadinessScore(analysis: WebsiteAnalysis, seed: number): number {
  const levels: MaturityLevel[] = [
    analysis.leadCaptureQuality,
    analysis.supportMaturity,
    analysis.marketingMaturity,
    analysis.automationMaturity,
  ];
  const toScore = (l: MaturityLevel) => (l === "Low" ? 40 : l === "Medium" ? 65 : 85);
  const maturityAvg = levels.reduce((sum, l) => sum + toScore(l), 0) / levels.length;
  const raw = maturityAvg * 0.6 + analysis.scanConfidence * 0.25 + (seed % 15) * 0.6;
  return Math.max(35, Math.min(96, Math.round(raw)));
}

function estimateTimeSavings(seed: number): string {
  const low = 8 + (seed % 12);
  const high = low + 8 + (seed % 6);
  return `${low}-${high} hours per week in reclaimable team capacity within 90 days`;
}

function buildValidationQuestions(analysis: WebsiteAnalysis, request: { industry?: string }, companyName: string): string[] {
  const questions = [
    `How many new leads or inquiries does ${companyName}'s website generate per month, and how quickly are they currently followed up on?`,
    "What percentage of incoming questions from prospects or customers are repetitive and could be answered without a human?",
    "What tools (CRM, scheduling, support desk) are currently in place, and how well are they actually being used day-to-day?",
    "Where does the team spend the most manual, repeatable time each week?",
    "What would a successful AI pilot need to prove within the first 90 days to get broader buy-in?",
  ];
  if (request.industry && request.industry.trim() && request.industry.trim().toLowerCase() !== analysis.industryGuess.toLowerCase()) {
    questions.unshift(
      `You indicated your industry is "${request.industry.trim()}" — AIScanner's website analysis detected patterns more consistent with ${analysis.industryGuess}. Can you confirm which best describes the business?`
    );
  }
  return questions.slice(0, 6);
}

export function generateReport(
  scanId: string,
  analysis: WebsiteAnalysis,
  request: { industry?: string; notes?: string },
  internalDetails?: InternalDetails
): AIOpportunityReport {
  const companyName = analysis.companyNameGuess;
  const seed = hashString(scanId);

  const recommendations = buildRecommendations(scanId, companyName, analysis);
  const detectedOpportunityAreas = Array.from(new Set(recommendations.map((r) => r.department)));

  const businessModelHypothesis = `${companyName} appears to operate as a${
    analysis.industryGuess === "E-Commerce & Retail" ? "n" : ""
  } ${analysis.industryGuess.toLowerCase()} business, primarily serving ${analysis.customerTypes
    .slice(0, 2)
    .join(" and ")
    .toLowerCase()}. Core offerings likely include ${analysis.productsServicesGuess.slice(0, 3).join(", ").toLowerCase()}. ${
    request.notes && request.notes.trim() ? `Additional context provided: "${request.notes.trim()}". ` : ""
  }This hypothesis is based on website structure and content patterns and should be validated directly with the client.`;

  const websiteIntelligenceSummary = `${analysis.websiteSummary} AIScanner detected ${analysis.websiteSignalsDetected.length} distinct signals on the site, including: ${analysis.websiteSignalsDetected
    .slice(0, 3)
    .join("; ")
    .toLowerCase()}. Technology maturity was assessed as ${analysis.leadCaptureQuality.toLowerCase()} lead capture, ${analysis.supportMaturity.toLowerCase()} support automation, ${analysis.marketingMaturity.toLowerCase()} marketing sophistication, and ${analysis.automationMaturity.toLowerCase()} back-office automation.`;

  const suggestedAiStack = Array.from(
    new Set(
      recommendations.map((r) => {
        const tpl = REC_TEMPLATES.find((t) => t.key === r.id);
        return tpl ? tpl.stack : r.title;
      })
    )
  );

  const topRec = recommendations[0];
  const recommendedNextStep = `Schedule a 30-minute AI Opportunity Review with ${companyName} to validate these hypotheses and scope a pilot for "${
    topRec ? topRec.title : "the top-ranked opportunity"
  }" — the highest ROI-to-effort opportunity identified in this scan.`;

  const internalNote = internalDetails
    ? Object.values(internalDetails).some((v) => v && v.trim())
      ? " Internal details provided by the team have been incorporated into this analysis."
      : ""
    : "";

  return {
    scanId,
    generatedAt: new Date().toISOString(),
    readinessScore: computeReadinessScore(analysis, seed),
    scanConfidence: analysis.scanConfidence,
    websiteIntelligenceSummary: websiteIntelligenceSummary + internalNote,
    businessModelHypothesis,
    detectedOpportunityAreas,
    websiteSignalsDetected: analysis.websiteSignalsDetected,
    recommendations,
    estimatedTimeSavings: estimateTimeSavings(seed),
    suggestedAiStack,
    roadmap: buildRoadmap(recommendations, companyName),
    validationQuestions: buildValidationQuestions(analysis, request, companyName),
    recommendedNextStep,
  };
}
