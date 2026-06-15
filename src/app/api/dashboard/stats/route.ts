import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [all, recent] = await Promise.all([
    prisma.prospect.findMany({ select: { status: true, fitScore: true, opportunityRating: true } }),
    prisma.prospect.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, companyName: true, fitScore: true, status: true, opportunityRating: true },
    }),
  ]);

  const scored = all.filter((p) => p.fitScore !== null);
  const avgFitScore = scored.length > 0 ? Math.round(scored.reduce((a, p) => a + (p.fitScore ?? 0), 0) / scored.length) : 0;

  return NextResponse.json({
    totalProspects: all.length,
    researched: all.filter((p) => ["RESEARCHED", "SCORED", "OUTREACH_READY", "IN_CRM"].includes(p.status)).length,
    scored: all.filter((p) => ["SCORED", "OUTREACH_READY", "IN_CRM"].includes(p.status)).length,
    outreachReady: all.filter((p) => p.status === "OUTREACH_READY").length,
    inCrm: all.filter((p) => p.status === "IN_CRM").length,
    avgFitScore,
    highOpportunities: all.filter((p) => p.opportunityRating === "HIGH").length,
    recentProspects: recent,
  });
}
