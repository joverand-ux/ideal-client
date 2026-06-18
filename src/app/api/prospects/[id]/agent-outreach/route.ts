import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runOutreachAgent } from "@/lib/outreach-agent";
import type { ProspectData, ClientProfileData } from "@/lib/outreach-agent";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [prospect, clientProfile] = await Promise.all([
    prisma.prospect.findUnique({ where: { id }, include: { businessSignals: true } }),
    prisma.clientProfile.findFirst(),
  ]);

  if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  if (!clientProfile) return NextResponse.json({ error: "No client profile found" }, { status: 400 });

  const prospectData: ProspectData = {
    id: prospect.id,
    companyName: prospect.companyName,
    website: prospect.website,
    industry: prospect.industry,
    location: prospect.location,
    employeeCount: prospect.employeeCount,
    companySummary: prospect.companySummary,
    fitReason: prospect.fitReason,
    fitScore: prospect.fitScore,
    recommendedConversation: prospect.recommendedConversation,
    services: prospect.services,
    businessSignals: prospect.businessSignals.map((s) => ({
      type: s.type,
      title: s.title,
      description: s.description,
    })),
  };

  const clientProfileData: ClientProfileData = {
    id: clientProfile.id,
    companyName: clientProfile.companyName,
    website: clientProfile.website,
    servicesOffered: clientProfile.servicesOffered,
    valueProposition: clientProfile.valueProposition,
    targetIndustries: clientProfile.targetIndustries,
    geography: clientProfile.geography,
    competitiveAdvantages: clientProfile.competitiveAdvantages,
  };

  const result = await runOutreachAgent(prospectData, clientProfileData);

  // Delete any existing AGENT draft for this prospect, then create a fresh one
  await prisma.outreachDraft.deleteMany({ where: { prospectId: id, type: "AGENT" } });

  const draft = await prisma.outreachDraft.create({
    data: {
      prospectId: id,
      type: "AGENT",
      subject: result.subject,
      // Store reasoning + type in body as structured text, then the message body
      body: JSON.stringify({
        reasoning: result.reasoning,
        outreachType: result.type,
        messageBody: result.body,
      }),
    },
  });

  return NextResponse.json(draft);
}
