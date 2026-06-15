import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { researchCompany } from "@/lib/research";
import { analyzeCompany } from "@/lib/ai";
import { SignalType, OpportunityRating } from "@prisma/client";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [prospect, clientProfile] = await Promise.all([
    prisma.prospect.findUnique({ where: { id } }),
    prisma.clientProfile.findFirst(),
  ]);

  if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  if (!clientProfile) return NextResponse.json({ error: "No client profile found" }, { status: 400 });

  await prisma.prospect.update({ where: { id }, data: { status: "RESEARCHING" } });

  try {
    const rawContent = await researchCompany(prospect.companyName, prospect.website);
    const analysis = await analyzeCompany(rawContent, clientProfile);

    await prisma.businessSignal.deleteMany({ where: { prospectId: id } });

    const updated = await prisma.prospect.update({
      where: { id },
      data: {
        companySummary: analysis.companySummary,
        services: analysis.services,
        marketsServed: analysis.marketsServed,
        locations: analysis.locations,
        leadershipInfo: analysis.leadershipInfo,
        fitScore: analysis.fitScore,
        fitReason: analysis.fitReason,
        confidenceScore: analysis.confidenceScore,
        opportunityRating: analysis.opportunityRating as OpportunityRating,
        recommendedConversation: analysis.recommendedConversation,
        status: "SCORED",
        researchedAt: new Date(),
        businessSignals: {
          create: analysis.businessSignals.map((s) => ({
            type: (s.type as SignalType) in SignalType ? (s.type as SignalType) : SignalType.OTHER,
            title: s.title,
            description: s.description,
            source: s.source,
          })),
        },
      },
      include: { businessSignals: true, outreachDrafts: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    await prisma.prospect.update({ where: { id }, data: { status: "NEW" } });
    console.error(err);
    return NextResponse.json({ error: "Research failed" }, { status: 500 });
  }
}
