import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { discoverSimilarCompanies } from "@/lib/ai";
import { SignalType } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.json() as { targetCompanyName: string; icpId?: string; count?: number };
  const { targetCompanyName, icpId, count = 25 } = body;

  if (!targetCompanyName?.trim()) {
    return NextResponse.json({ error: "targetCompanyName is required" }, { status: 400 });
  }

  const clientProfile = await prisma.clientProfile.findFirst();
  if (!clientProfile) {
    return NextResponse.json({ error: "No client profile found. Please set up your profile first." }, { status: 400 });
  }

  const companies = await discoverSimilarCompanies(targetCompanyName.trim(), clientProfile, count);
  if (!companies.length) {
    return NextResponse.json({ error: "Discovery returned no results. Try a different company name." }, { status: 500 });
  }

  const created = await Promise.all(
    companies.map(async (c) => {
      const prospect = await prisma.prospect.create({
        data: {
          companyName: c.companyName,
          website: c.website || null,
          industry: c.industry || null,
          location: c.headquarters || null,
          employeeCount: c.estimatedEmployees || null,
          revenueEstimate: c.revenueEstimate || null,
          icpId: icpId || null,
          status: "SCORED",
          companySummary: c.reasonForMatch,
          leadershipInfo: c.keyDecisionMakers || null,
          keyDecisionMakers: c.keyDecisionMakers || null,
          linkedinUrl: c.linkedinUrl || null,
          technologyNeed: c.technologyNeed || null,
          fitScore: c.connectiqScore,
          fitReason: c.reasonForMatch,
          confidenceScore: c.connectiqScore,
          opportunityRating: c.connectiqScore >= 70 ? "HIGH" : c.connectiqScore >= 45 ? "MEDIUM" : "LOW",
          connectiqScore: c.connectiqScore,
          growthSignalsScore: c.growthSignalsScore,
          technologyScore: c.technologyScore,
          revenuePotentialScore: c.revenuePotentialScore,
          companySizeFitScore: c.companySizeFitScore,
          triggerEventsScore: c.triggerEventsScore,
          aiAutomationScore: c.aiAutomationScore,
          priorityTier: c.priorityTier,
          estimatedPipelineValue: c.estimatedPipelineValue || null,
          sourceCompany: targetCompanyName.trim(),
          recommendedConversation: c.reasonForMatch,
          source: "ConnectIQ Discovery",
          researchedAt: new Date(),
          businessSignals: {
            create: [
              ...c.growthSignals.map((s) => ({
                type: SignalType.OTHER,
                title: s,
                description: "Discovered via ICP analysis",
                source: "ConnectIQ AI",
              })),
              ...c.triggerEvents.map((e) => ({
                type: SignalType.OTHER,
                title: e,
                description: "Trigger event identified",
                source: "ConnectIQ AI",
              })),
            ],
          },
        },
        include: { businessSignals: true },
      });
      return prospect;
    })
  );

  return NextResponse.json({
    count: created.length,
    sourceCompany: targetCompanyName,
    hot: created.filter((p) => p.priorityTier === "HOT").length,
    warm: created.filter((p) => p.priorityTier === "WARM").length,
    future: created.filter((p) => p.priorityTier === "FUTURE").length,
    prospects: created,
  });
}
