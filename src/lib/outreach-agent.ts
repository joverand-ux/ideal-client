import Anthropic from "@anthropic-ai/sdk";
import { researchCompany } from "./research";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

export interface ProspectData {
  id: string;
  companyName: string;
  website: string | null;
  industry: string | null;
  location: string | null;
  employeeCount: number | null;
  companySummary: string | null;
  fitReason: string | null;
  fitScore: number | null;
  recommendedConversation: string | null;
  services: string[];
  businessSignals: Array<{ type: string; title: string; description: string | null }>;
}

export interface ClientProfileData {
  id: string;
  companyName: string;
  website: string | null;
  servicesOffered: string[];
  valueProposition: string | null;
  targetIndustries: string[];
  geography: string[];
  competitiveAdvantages: string[];
}

export type OutreachTypeDecision =
  | "intro_email"
  | "demo_request"
  | "targeted_marketing"
  | "introduction";

export interface AgentOutreachResult {
  type: OutreachTypeDecision;
  subject: string;
  body: string;
  reasoning: string;
}

// Tool definitions for the agent
const tools: Anthropic.Tool[] = [
  {
    name: "research_company",
    description:
      "Scrapes and summarizes the prospect company's website to gather information about their services, markets, and signals.",
    input_schema: {
      type: "object" as const,
      properties: {
        companyName: { type: "string", description: "The prospect company name" },
        website: { type: "string", description: "The prospect website URL (or null if none)" },
      },
      required: ["companyName"],
    },
  },
  {
    name: "get_client_profile",
    description: "Returns the client profile (our client who wants to send outreach) with their services and value proposition.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "decide_outreach_type",
    description:
      "Decides the best outreach type based on the prospect's fit, signals, and context. Returns one of: intro_email, demo_request, targeted_marketing, introduction.",
    input_schema: {
      type: "object" as const,
      properties: {
        reasoning: {
          type: "string",
          description: "Your reasoning for choosing this outreach type",
        },
        outreachType: {
          type: "string",
          enum: ["intro_email", "demo_request", "targeted_marketing", "introduction"],
          description: "The chosen outreach type",
        },
      },
      required: ["reasoning", "outreachType"],
    },
  },
  {
    name: "craft_message",
    description:
      "Crafts the final personalized outreach message with a subject and body based on the chosen type. intro_email: warm intro requesting a conversation. demo_request: asks for a product/service demo. targeted_marketing: educational value-first email. introduction: mutual connection style intro.",
    input_schema: {
      type: "object" as const,
      properties: {
        subject: { type: "string", description: "Email subject line" },
        body: { type: "string", description: "Full message body (3-4 paragraphs, professional and personalized)" },
      },
      required: ["subject", "body"],
    },
  },
];

export async function runOutreachAgent(
  prospect: ProspectData,
  clientProfile: ClientProfileData
): Promise<AgentOutreachResult> {
  const systemPrompt = `You are an expert B2B outreach specialist for ${clientProfile.companyName}.
Your job is to autonomously research a prospect company, decide on the best outreach strategy, and craft a highly personalized message.

Work methodically:
1. Research the prospect company using the research_company tool
2. Get the client profile to understand who you're sending on behalf of
3. Decide the outreach type based on fit signals and context
4. Craft a personalized final message

Be thorough and strategic. The goal is maximum response rate through personalization.`;

  const userMessage = `Research and craft outreach for this prospect:
Company: ${prospect.companyName}
Website: ${prospect.website || "unknown"}
Industry: ${prospect.industry || "unknown"}
Location: ${prospect.location || "unknown"}
Employees: ${prospect.employeeCount ?? "unknown"}
Existing summary: ${prospect.companySummary || "none"}
Fit score: ${prospect.fitScore ?? "not scored"}
Fit reason: ${prospect.fitReason || "none"}
Business signals: ${prospect.businessSignals.map((s) => `${s.type}: ${s.title}`).join(", ") || "none"}

Use your tools to research, decide, and craft the best outreach message.`;

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];

  // State collected across tool calls
  let decidedType: OutreachTypeDecision = "intro_email";
  let decidedReasoning = "";
  let researchResult = "";
  let finalSubject = "";
  let finalBody = "";

  // Agentic loop
  while (true) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages,
    });

    // Append the assistant response
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      break;
    }

    if (response.stop_reason !== "tool_use") {
      break;
    }

    // Process tool calls
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      let result: string;

      if (block.name === "research_company") {
        const input = block.input as { companyName: string; website?: string };
        researchResult = await researchCompany(input.companyName, input.website ?? null);
        result = researchResult || "No website content found. Using company name only.";
      } else if (block.name === "get_client_profile") {
        result = JSON.stringify({
          companyName: clientProfile.companyName,
          website: clientProfile.website,
          servicesOffered: clientProfile.servicesOffered,
          valueProposition: clientProfile.valueProposition,
          targetIndustries: clientProfile.targetIndustries,
          geography: clientProfile.geography,
          competitiveAdvantages: clientProfile.competitiveAdvantages,
        });
      } else if (block.name === "decide_outreach_type") {
        const input = block.input as { reasoning: string; outreachType: string };
        decidedType = input.outreachType as OutreachTypeDecision;
        decidedReasoning = input.reasoning;
        result = `Outreach type set to: ${decidedType}`;
      } else if (block.name === "craft_message") {
        const input = block.input as { subject: string; body: string };
        finalSubject = input.subject;
        finalBody = input.body;
        result = "Message crafted successfully.";
      } else {
        result = "Unknown tool.";
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  // Fallback if agent didn't call craft_message
  if (!finalBody) {
    finalSubject = `Introduction from ${clientProfile.companyName}`;
    finalBody = "Unable to generate outreach message. Please try again.";
  }

  return {
    type: decidedType,
    subject: finalSubject,
    body: finalBody,
    reasoning: decidedReasoning,
  };
}
