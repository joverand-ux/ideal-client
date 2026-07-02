// TODO(real-crawler): Replace this mock analyzer with a real website crawler
// (e.g. headless browser + cheerio/Playwright) that fetches the live site,
// parses copy, nav structure, forms, and metadata instead of guessing from
// the URL string alone.
// TODO(ai-analysis): Once real page content is available, pipe it through
// Claude/OpenAI (see src/lib/ai.ts) to replace this keyword heuristic with
// genuine language-model analysis of the business.
// TODO(enrichment): Cross-reference with LinkedIn/company enrichment APIs
// (e.g. Clearbit, LinkedIn Company API) to confirm industry, size, and
// leadership info detected here.
// TODO(competitors): Replace the static competitor pools with a real
// competitor-lookup service (e.g. SEMrush/SimilarWeb API) keyed on domain.

export type MaturityLevel = "Low" | "Medium" | "High";

export type Industry =
  | "Legal Services"
  | "Real Estate & Finance"
  | "Healthcare"
  | "E-Commerce & Retail"
  | "General Professional Services";

export interface AnalyzerInput {
  url: string;
  companyName?: string;
  industry?: string;
  competitors?: string;
  notes?: string;
}

export interface WebsiteAnalysis {
  companyNameGuess: string;
  industryGuess: Industry;
  websiteSummary: string;
  productsServicesGuess: string[];
  customerTypes: string[];
  leadCaptureQuality: MaturityLevel;
  supportMaturity: MaturityLevel;
  marketingMaturity: MaturityLevel;
  automationMaturity: MaturityLevel;
  technologySignals: string[];
  possibleCompetitors: string[];
  aiOpportunityHypotheses: string[];
  scanConfidence: number;
  websiteSignalsDetected: string[];
}

interface IndustryProfile {
  summary: string;
  products: string[];
  customerTypes: string[];
  technologySignals: string[];
  competitors: string[];
  opportunityHypotheses: string[];
  websiteSignals: string[];
}

const INDUSTRY_PROFILES: Record<Industry, IndustryProfile> = {
  "Legal Services": {
    summary:
      "The site presents as a legal practice offering client consultations, case-based services, and credibility-driven content (attorney bios, practice areas, case results).",
    products: [
      "Case consultations",
      "Practice-area specific legal representation",
      "Document preparation & review",
      "Client intake for new matters",
    ],
    customerTypes: ["Individuals seeking representation", "Small business clients", "Referral-based clients"],
    technologySignals: [
      "Basic contact form with no intake qualification",
      "No visible live chat widget",
      "Static attorney bio pages",
      "No online scheduling detected",
      "Testimonials/case results used for trust building",
    ],
    competitors: [
      "Other local firms in the same practice area",
      "Regional multi-practice law groups",
      "National legal marketplaces (e.g. Avvo, LegalMatch listings)",
    ],
    opportunityHypotheses: [
      "Prospective clients likely abandon the intake form due to lack of instant response",
      "Manual intake is probably delaying case qualification and follow-up",
      "Repetitive client questions about process/pricing are likely handled manually by staff",
    ],
    websiteSignals: [
      "Practice area pages present",
      "Attorney bio / credibility pages present",
      "Contact form detected",
      "No self-service scheduling detected",
      "No AI chat or virtual assistant detected",
    ],
  },
  "Real Estate & Finance": {
    summary:
      "The site reflects a real estate, mortgage, title, or appraisal business focused on transaction-driven services, listings or rate information, and local market credibility.",
    products: [
      "Property listings / valuations",
      "Mortgage or financing options",
      "Title or appraisal services",
      "Transaction coordination",
    ],
    customerTypes: ["Home buyers & sellers", "Investors", "Referral partners (agents, lenders, attorneys)"],
    technologySignals: [
      "Static rate/listing information not personalized to visitor",
      "Lead capture form without automated routing",
      "No visible CRM-connected follow-up sequence",
      "Manual quote/estimate request process",
    ],
    competitors: [
      "Competing local brokerages or lenders",
      "National platforms (e.g. Zillow, Redfin, Rocket Mortgage) competing for the same searches",
      "Independent agents/brokers in the same market",
    ],
    opportunityHypotheses: [
      "Rate/quote requests are likely manually processed, slowing time-to-response",
      "Lead follow-up after initial inquiry is probably inconsistent",
      "Document-heavy transactions likely rely on manual intake and classification",
    ],
    websiteSignals: [
      "Listings or rate information present",
      "Lead capture / quote request form detected",
      "No live chat detected",
      "No automated follow-up sequence detected",
      "Local market trust signals (testimonials, service area) present",
    ],
  },
  Healthcare: {
    summary:
      "The site represents a healthcare, dental, or clinic practice centered on patient acquisition, appointment scheduling, and service/procedure information.",
    products: [
      "Patient appointments / consultations",
      "Procedure or treatment information",
      "New patient intake",
      "Insurance & billing information",
    ],
    customerTypes: ["New patients", "Returning/recurring patients", "Referral network (other providers)"],
    technologySignals: [
      "Appointment request form without instant confirmation",
      "No visible patient chat/support widget",
      "FAQ content spread across multiple static pages",
      "No automated appointment reminders detected",
    ],
    competitors: [
      "Other local practices offering similar procedures",
      "Regional multi-location healthcare groups",
      "Telehealth-first competitors",
    ],
    opportunityHypotheses: [
      "New patient scheduling likely requires phone/staff involvement, adding friction",
      "Common patient questions (insurance, prep instructions) are probably answered manually",
      "Patient intake paperwork is likely still handled via PDFs or in person",
    ],
    websiteSignals: [
      "Appointment request form detected",
      "Procedure/treatment pages present",
      "No live chat or scheduling automation detected",
      "Insurance/billing FAQ content present",
      "Patient testimonials present",
    ],
  },
  "E-Commerce & Retail": {
    summary:
      "The site operates as an online store or retail brand focused on product discovery, cart conversion, and customer support at scale.",
    products: ["Direct product sales", "Order fulfillment & shipping", "Customer support / returns", "Loyalty or repeat-purchase offers"],
    customerTypes: ["Direct-to-consumer shoppers", "Repeat/loyalty customers", "Wholesale or B2B buyers"],
    technologySignals: [
      "Standard e-commerce checkout flow detected",
      "Support handled via email/contact form rather than chat",
      "Product FAQ content duplicated across product pages",
      "No visible personalized product recommendations",
    ],
    competitors: [
      "Marketplace competitors (e.g. Amazon/Etsy listings in the same category)",
      "Direct-to-consumer brands in the same vertical",
      "Larger retail chains carrying similar products",
    ],
    opportunityHypotheses: [
      "Pre-purchase questions likely go unanswered outside business hours, costing conversions",
      "Order status and return questions are probably a high-volume manual support burden",
      "Abandoned carts likely lack automated, personalized follow-up",
    ],
    websiteSignals: [
      "Checkout / cart flow detected",
      "No live chat widget detected",
      "Product review content present",
      "No abandoned-cart automation detected",
      "Email signup capture present",
    ],
  },
  "General Professional Services": {
    summary:
      "The site represents a professional services business (consulting, agency, B2B services, or similar) built around expertise positioning and inbound lead generation.",
    products: ["Consulting / advisory engagements", "Project-based service delivery", "Retainer or ongoing service packages", "Proposal-based custom work"],
    customerTypes: ["Small and mid-sized businesses", "Enterprise clients", "Referral and repeat clients"],
    technologySignals: [
      "General contact form with no lead qualification",
      "No live chat or chatbot detected",
      "Case studies / portfolio used for credibility",
      "No visible CRM or scheduling integration",
    ],
    competitors: [
      "Other boutique firms offering similar services locally",
      "Larger agencies/consultancies competing for the same RFPs",
      "Freelance/independent providers in the same niche",
    ],
    opportunityHypotheses: [
      "Inbound leads likely wait for manual qualification before a response",
      "Proposal/quote generation is probably a manual, time-intensive process",
      "Client status updates and follow-ups likely rely on ad-hoc email rather than a system",
    ],
    websiteSignals: [
      "Contact/inquiry form detected",
      "Case studies or portfolio present",
      "No chat or virtual assistant detected",
      "No online scheduling detected",
      "Service pages present without pricing transparency",
    ],
  },
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickMany<T>(arr: T[], seed: number, count: number): T[] {
  const result: T[] = [];
  const used = new Set<number>();
  let i = 0;
  const max = Math.min(count, arr.length);
  while (result.length < max && i < arr.length * 3) {
    const idx = (seed + i * 7) % arr.length;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(arr[idx]);
    }
    i++;
  }
  return result;
}

function levelFromSeed(seed: number, offset: number): MaturityLevel {
  const levels: MaturityLevel[] = ["Low", "Low", "Medium", "Medium", "High"];
  return levels[(seed + offset) % levels.length];
}

function guessCompanyNameFromUrl(url: string, hint?: string): string {
  if (hint && hint.trim()) return hint.trim();
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "");
    const domainLabel = hostname.split(".").slice(0, -1).join(".") || hostname;
    const words = domainLabel
      .split(/[-_.]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    return words.join(" ") || hostname;
  } catch {
    return "Your Company";
  }
}

export function detectIndustryFromUrl(url: string): Industry {
  const lower = url.toLowerCase();
  if (lower.includes("law")) return "Legal Services";
  if (
    lower.includes("realestate") ||
    lower.includes("mortgage") ||
    lower.includes("title") ||
    lower.includes("appraisal")
  ) {
    return "Real Estate & Finance";
  }
  if (lower.includes("dental") || lower.includes("clinic") || lower.includes("health")) {
    return "Healthcare";
  }
  if (lower.includes("shop") || lower.includes("store") || lower.includes("commerce")) {
    return "E-Commerce & Retail";
  }
  return "General Professional Services";
}

/**
 * Deterministic mock analyzer: no real network request is made. The same
 * URL always produces the same result, but different URLs within the same
 * detected industry vary (via a hash-based seed) so demos don't look canned.
 */
export function analyzeWebsite(input: AnalyzerInput): WebsiteAnalysis {
  const industry = detectIndustryFromUrl(input.url);
  const profile = INDUSTRY_PROFILES[industry];
  const seed = hashString(input.url.toLowerCase());

  const notesBoost = input.notes && input.notes.trim().length > 0 ? 6 : 0;
  const competitorBoost = input.competitors && input.competitors.trim().length > 0 ? 4 : 0;
  const scanConfidence = Math.min(97, 62 + (seed % 26) + notesBoost + competitorBoost);

  return {
    companyNameGuess: guessCompanyNameFromUrl(input.url, input.companyName),
    industryGuess: industry,
    websiteSummary: profile.summary,
    productsServicesGuess: pickMany(profile.products, seed, Math.min(4, profile.products.length)),
    customerTypes: profile.customerTypes,
    leadCaptureQuality: levelFromSeed(seed, 1),
    supportMaturity: levelFromSeed(seed, 2),
    marketingMaturity: levelFromSeed(seed, 3),
    automationMaturity: levelFromSeed(seed, 4),
    technologySignals: pickMany(profile.technologySignals, seed, Math.min(4, profile.technologySignals.length)),
    possibleCompetitors: input.competitors
      ? input.competitors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : profile.competitors,
    aiOpportunityHypotheses: profile.opportunityHypotheses,
    scanConfidence,
    websiteSignalsDetected: pickMany(profile.websiteSignals, seed, profile.websiteSignals.length),
  };
}
