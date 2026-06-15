import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

interface ClientProfileInput {
  companyName: string;
  servicesOffered: string[];
  valueProposition: string | null;
  targetIndustries: string[];
}

export interface AnalysisResult {
  companySummary: string;
  services: string[];
  marketsServed: string[];
  locations: string[];
  leadershipInfo: string;
  businessSignals: Array<{ type: string; title: string; description: string; source: string }>;
  fitScore: number;
  fitReason: string;
  confidenceScore: number;
  opportunityRating: "LOW" | "MEDIUM" | "HIGH";
  recommendedConversation: string;
}

export async function analyzeCompany(rawContent: string, clientProfile: ClientProfileInput): Promise<AnalysisResult> {
  const prompt = `You are a B2B business development analyst. Analyze this company and score their fit as a potential client.

CLIENT PROFILE (our client who wants to sell to this prospect):
Company: ${clientProfile.companyName}
Services: ${clientProfile.servicesOffered.join(", ")}
Value Proposition: ${clientProfile.valueProposition || "Not specified"}
Target Industries: ${clientProfile.targetIndustries.join(", ")}

PROSPECT DATA:
${rawContent}

Respond with a JSON object (no markdown, just raw JSON) with this exact structure:
{
  "companySummary": "2-3 sentence summary of what this company does",
  "services": ["service1", "service2"],
  "marketsServed": ["market1", "market2"],
  "locations": ["city, state"],
  "leadershipInfo": "Key leaders and their roles if found",
  "businessSignals": [
    {
      "type": "HIRING|EXPANSION|NEW_OFFICE|AWARD|LEADERSHIP_CHANGE|PRESS_RELEASE|NEW_PROJECT|PARTNERSHIP|FUNDING|OTHER",
      "title": "Short signal title",
      "description": "What this signal means for potential engagement",
      "source": "Where this was found"
    }
  ],
  "fitScore": 75,
  "fitReason": "Specific reason this company is a fit based on the client's services",
  "confidenceScore": 80,
  "opportunityRating": "HIGH",
  "recommendedConversation": "Specific outreach angle to use with this prospect"
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    return JSON.parse(text) as AnalysisResult;
  } catch {
    return {
      companySummary: "Unable to analyze company at this time.",
      services: [], marketsServed: [], locations: [], leadershipInfo: "",
      businessSignals: [], fitScore: 0, fitReason: "Analysis failed",
      confidenceScore: 0, opportunityRating: "LOW", recommendedConversation: "",
    };
  }
}

interface ProspectInput {
  companyName: string;
  companySummary: string | null;
  fitReason: string | null;
  recommendedConversation: string | null;
  services: string[];
  businessSignals: Array<{ type: string; title: string; description: string }>;
}

export interface OutreachResult {
  email: { subject: string; body: string };
  linkedin: string;
  callScript: string;
  meetingBrief: string;
}

export async function generateOutreach(prospectData: ProspectInput, clientProfile: ClientProfileInput): Promise<OutreachResult> {
  const prompt = `You are a B2B sales expert. Generate personalized outreach for this prospect.

OUR CLIENT:
Company: ${clientProfile.companyName}
Services: ${clientProfile.servicesOffered.join(", ")}
Value Proposition: ${clientProfile.valueProposition || ""}

PROSPECT:
Company: ${prospectData.companyName}
Summary: ${prospectData.companySummary || ""}
Fit Reason: ${prospectData.fitReason || ""}
Recommended Angle: ${prospectData.recommendedConversation || ""}
Their Services: ${prospectData.services.join(", ")}
Business Signals: ${prospectData.businessSignals.map((s) => s.title + ": " + s.description).join("; ")}

Respond with raw JSON (no markdown):
{
  "email": {
    "subject": "Email subject line",
    "body": "Full email body (3-4 paragraphs, professional, personalized)"
  },
  "linkedin": "LinkedIn connection message (under 300 chars)",
  "callScript": "30-second call opener script",
  "meetingBrief": "1-page meeting preparation brief"
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
      email: { subject: "Introduction from " + clientProfile.companyName, body: "Unable to generate email at this time." },
      linkedin: "Unable to generate LinkedIn message.",
      callScript: "Unable to generate call script.",
      meetingBrief: "Unable to generate meeting brief.",
    };
  }
}
