import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

interface ClientProfileInput {
  companyName: string;
  servicesOffered: string[];
  valueProposition: string | null;
  targetIndustries: string[];
  competitiveAdvantages?: string[];
}

// ── Discovery ────────────────────────────────────────────────────────────────

export interface DiscoveredCompany {
  companyName: string;
  website: string;
  industry: string;
  estimatedEmployees: number | null;
  revenueEstimate: string;
  headquarters: string;
  keyDecisionMakers: string;
  linkedinUrl: string;
  growthSignals: string[];
  aiAutomationScore: number;
  technologyNeed: string;
  reasonForMatch: string;
  // ConnectIQ scoring (1-100)
  connectiqScore: number;
  growthSignalsScore: number;
  technologyScore: number;
  revenuePotentialScore: number;
  companySizeFitScore: number;
  triggerEventsScore: number;
  priorityTier: "HOT" | "WARM" | "FUTURE";
  estimatedPipelineValue: string;
  triggerEvents: string[];
  likelyProblems: string[];
  recommendedServices: string[];
}

export async function discoverSimilarCompanies(
  targetCompanyName: string,
  clientProfile: ClientProfileInput,
  count: number = 25
): Promise<DiscoveredCompany[]> {
  const prompt = `You are a senior B2B growth strategist, sales researcher, and market intelligence analyst specializing in identifying high-probability prospects for managed IT, cybersecurity, AI automation, ERP, CRM, and business process improvement services.

SELLER PROFILE (who is selling):
Company: ${clientProfile.companyName}
Services: ${clientProfile.servicesOffered.join(", ")}
Value Proposition: ${clientProfile.valueProposition || "Not specified"}
Target Industries: ${clientProfile.targetIndustries.join(", ")}
Competitive Advantages: ${clientProfile.competitiveAdvantages?.join(", ") || "Not specified"}

TARGET COMPANY TO ANALYZE: ${targetCompanyName}

TASK:
1. First analyze ${targetCompanyName}: its industry, revenue range, employee count, geographic footprint, growth stage, technology stack, operational complexity, and growth signals.
2. Then identify ${count} similar companies that match the same Ideal Customer Profile — companies experiencing business conditions that create URGENCY to buy within the next 6-12 months.

For each company apply the ConnectIQ Scoring Formula:
- Growth Signals: 25 points max
- Technology Need: 25 points max
- Revenue Potential: 20 points max
- Company Size Fit: 15 points max
- Trigger Events: 15 points max
Total: 1-100

Prioritize:
- HOT (score 70-100): Immediate outreach — active trigger events, clear technology gaps, growth signals
- WARM (score 45-69): Nurture — good fit but no immediate trigger
- FUTURE (score 1-44): Future opportunity — early stage fit

Think like a VP of Sales: find companies most likely to BUY, not just companies that look similar.

Respond ONLY with a valid JSON array (no markdown, no explanation) of exactly ${count} objects:
[
  {
    "companyName": "Acme Corp",
    "website": "https://acmecorp.com",
    "industry": "Construction",
    "estimatedEmployees": 120,
    "revenueEstimate": "$15M-$25M",
    "headquarters": "Pittsburgh, PA",
    "keyDecisionMakers": "CEO: John Smith, IT Director: Jane Doe",
    "linkedinUrl": "https://linkedin.com/company/acme-corp",
    "growthSignals": ["Opened 2nd location Q1 2024", "Hired 15 new employees last 90 days"],
    "aiAutomationScore": 8,
    "technologyNeed": "Outdated ERP, manual estimating process, no CRM",
    "reasonForMatch": "Mid-size contractor with identical profile to ${targetCompanyName}, currently undergoing growth that creates IT infrastructure gaps",
    "connectiqScore": 82,
    "growthSignalsScore": 22,
    "technologyScore": 23,
    "revenuePotentialScore": 16,
    "companySizeFitScore": 13,
    "triggerEventsScore": 8,
    "priorityTier": "HOT",
    "estimatedPipelineValue": "$85,000-$120,000 ARR",
    "triggerEvents": ["New office opening", "Recent hiring surge"],
    "likelyProblems": ["Manual processes", "Disconnected systems", "No centralized data"],
    "recommendedServices": ["Managed IT", "ERP Implementation", "Business Intelligence"]
  }
]`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  try {
    const raw = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(raw) as DiscoveredCompany[];
  } catch {
    return [];
  }
}

// ── Research / Analysis ──────────────────────────────────────────────────────

export interface AnalysisResult {
  companySummary: string;
  services: string[];
  marketsServed: string[];
  locations: string[];
  leadershipInfo: string;
  keyDecisionMakers: string;
  revenueEstimate: string;
  technologyNeed: string;
  likelyProblems: string[];
  recommendedServices: string[];
  businessSignals: Array<{ type: string; title: string; description: string; source: string }>;
  // ConnectIQ scoring
  connectiqScore: number;
  growthSignalsScore: number;
  technologyScore: number;
  revenuePotentialScore: number;
  companySizeFitScore: number;
  triggerEventsScore: number;
  aiAutomationScore: number;
  priorityTier: "HOT" | "WARM" | "FUTURE";
  estimatedPipelineValue: string;
  fitScore: number;
  fitReason: string;
  confidenceScore: number;
  opportunityRating: "LOW" | "MEDIUM" | "HIGH";
  recommendedConversation: string;
}

export async function analyzeCompany(
  rawContent: string,
  clientProfile: ClientProfileInput
): Promise<AnalysisResult> {
  const prompt = `You are a senior B2B growth strategist and sales intelligence analyst.

SELLER PROFILE:
Company: ${clientProfile.companyName}
Services: ${clientProfile.servicesOffered.join(", ")}
Value Proposition: ${clientProfile.valueProposition || "Not specified"}
Target Industries: ${clientProfile.targetIndustries.join(", ")}

PROSPECT DATA:
${rawContent}

Analyze this prospect using the ConnectIQ framework. Apply the scoring formula:
- Growth Signals Score (max 25): Recent hiring, expansion, new locations, awards, partnerships
- Technology Score (max 25): Outdated tech, manual processes, integration gaps, cyber risk
- Revenue Potential Score (max 20): ARR opportunity based on company size and needs
- Company Size Fit Score (max 15): Match to seller's ideal company profile
- Trigger Events Score (max 15): Funding, M&A, leadership change, ERP/CRM implementation, digital transformation

Total ConnectIQ Score 1-100.
Priority Tier: HOT (70-100), WARM (45-69), FUTURE (1-44).

Respond with raw JSON only (no markdown):
{
  "companySummary": "2-3 sentence summary",
  "services": ["service1"],
  "marketsServed": ["market1"],
  "locations": ["city, state"],
  "leadershipInfo": "Key leaders and roles",
  "keyDecisionMakers": "Decision maker names and titles",
  "revenueEstimate": "$10M-$20M",
  "technologyNeed": "Description of technology gaps",
  "likelyProblems": ["Manual processes", "Legacy software"],
  "recommendedServices": ["Managed IT", "Cybersecurity"],
  "businessSignals": [
    {
      "type": "HIRING|EXPANSION|NEW_OFFICE|AWARD|LEADERSHIP_CHANGE|PRESS_RELEASE|NEW_PROJECT|PARTNERSHIP|FUNDING|OTHER",
      "title": "Signal title",
      "description": "What this means for engagement",
      "source": "Where found"
    }
  ],
  "connectiqScore": 78,
  "growthSignalsScore": 20,
  "technologyScore": 22,
  "revenuePotentialScore": 16,
  "companySizeFitScore": 12,
  "triggerEventsScore": 8,
  "aiAutomationScore": 7,
  "priorityTier": "HOT",
  "estimatedPipelineValue": "$60,000-$90,000 ARR",
  "fitScore": 78,
  "fitReason": "Specific reason this company fits the seller's ICP",
  "confidenceScore": 82,
  "opportunityRating": "HIGH",
  "recommendedConversation": "Specific angle to open with this prospect"
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    return JSON.parse(text) as AnalysisResult;
  } catch {
    return {
      companySummary: "Unable to analyze company at this time.",
      services: [], marketsServed: [], locations: [], leadershipInfo: "",
      keyDecisionMakers: "", revenueEstimate: "", technologyNeed: "",
      likelyProblems: [], recommendedServices: [],
      businessSignals: [],
      connectiqScore: 0, growthSignalsScore: 0, technologyScore: 0,
      revenuePotentialScore: 0, companySizeFitScore: 0, triggerEventsScore: 0,
      aiAutomationScore: 0, priorityTier: "FUTURE", estimatedPipelineValue: "",
      fitScore: 0, fitReason: "Analysis failed", confidenceScore: 0,
      opportunityRating: "LOW", recommendedConversation: "",
    };
  }
}

// ── Outreach ─────────────────────────────────────────────────────────────────

interface ProspectInput {
  companyName: string;
  companySummary: string | null;
  fitReason: string | null;
  recommendedConversation: string | null;
  technologyNeed: string | null;
  likelyProblems: string[];
  recommendedServices: string[];
  estimatedPipelineValue: string | null;
  services: string[];
  businessSignals: Array<{ type: string; title: string; description: string }>;
  priorityTier: string | null;
}

export interface OutreachResult {
  executiveEmail: { subject: string; body: string };
  linkedin: string;
  valueIntro: string;
  callScript: string;
  meetingBrief: string;
}

export async function generateOutreach(
  prospectData: ProspectInput,
  clientProfile: ClientProfileInput
): Promise<OutreachResult> {
  const signals = prospectData.businessSignals.map((s) => `${s.title}: ${s.description}`).join("; ");

  const prompt = `You are a B2B sales expert specializing in personalized, signal-driven outreach. Generate 3 outreach variations for this prospect.

SELLER:
Company: ${clientProfile.companyName}
Services: ${clientProfile.servicesOffered.join(", ")}
Value Proposition: ${clientProfile.valueProposition || ""}

PROSPECT:
Company: ${prospectData.companyName}
Summary: ${prospectData.companySummary || ""}
Priority: ${prospectData.priorityTier || "WARM"}
Fit Reason: ${prospectData.fitReason || ""}
Recommended Angle: ${prospectData.recommendedConversation || ""}
Technology Need: ${prospectData.technologyNeed || ""}
Likely Problems: ${prospectData.likelyProblems.join(", ")}
Recommended Services: ${prospectData.recommendedServices.join(", ")}
Business Signals: ${signals}
Estimated Pipeline: ${prospectData.estimatedPipelineValue || ""}

OUTREACH RULES:
- Personalized — reference specific growth signals or business conditions
- Mention the specific business challenge you identified
- Avoid generic sales language
- Executive Email and LinkedIn MUST be under 150 words
- Value Intro is a 2-sentence "what we do and why it matters to you" opener
- No fluff, no buzzwords — be direct and specific

Respond with raw JSON only (no markdown):
{
  "executiveEmail": {
    "subject": "compelling subject line referencing a specific signal",
    "body": "personalized email body under 150 words"
  },
  "linkedin": "LinkedIn connection message under 150 words — conversational, not salesy",
  "valueIntro": "2-sentence value-based introduction specific to their situation",
  "callScript": "30-second call opener referencing a specific trigger event",
  "meetingBrief": "1-paragraph meeting prep summary with talking points"
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    return JSON.parse(text) as OutreachResult;
  } catch {
    return {
      executiveEmail: { subject: `Introduction from ${clientProfile.companyName}`, body: "Unable to generate at this time." },
      linkedin: "Unable to generate LinkedIn message.",
      valueIntro: "Unable to generate value intro.",
      callScript: "Unable to generate call script.",
      meetingBrief: "Unable to generate meeting brief.",
    };
  }
}
