import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [all, top10, recent] = await Promise.all([
    prisma.prospect.findMany({
      select: { status: true, fitScore: true, opportunityRating: true, connectiqScore: true, priorityTier: true },
    }),
    prisma.prospect.findMany({
      where: { connectiqScore: { not: null } },
      orderBy: { connectiqScore: "desc" },
      take: 10,
      select: { id: true, companyName: true, connectiqScore: true, priorityTier: true, status: true, estimatedPipelineValue: true, industry: true },
    }),
    prisma.prospect.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, companyName: true, connectiqScore: true, fitScore: true, status: true, opportunityRating: true, priorityTier: true },
    }),
  ]);

  const scored = all.filter((p) => p.connectiqScore !== null);
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((a, p) => a + (p.connectiqScore ?? 0), 0) / scored.length)
    : 0;

  return NextResponse.json({
    totalProspects: all.length,
    hot: all.filter((p) => p.priorityTier === "HOT").length,
    warm: all.filter((p) => p.priorityTier === "WARM").length,
    outreachReady: all.filter((p) => p.status === "OUTREACH_READY").length,
    inCrm: all.filter((p) => p.status === "IN_CRM").length,
    avgConnectiqScore: avgScore,
    highOpportunities: all.filter((p) => p.opportunityRating === "HIGH").length,
    top10Prospects: top10,
    recentProspects: recent,
  });
}
