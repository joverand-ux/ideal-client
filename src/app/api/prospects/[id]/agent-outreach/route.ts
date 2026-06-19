import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runOutreachAgent } from "@/lib/outreach-agent";
import type { ProspectData, ClientProfileData } from "@/lib/outreach-agent";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    // Store subject from agent, body as plaintext message, reasoning prepended with separator
    const fullBody = result.reasoning
      ? `[REASONING]\n${result.reasoning}\n\n[MESSAGE]\n${result.body}`
      : result.body;

    const draft = await prisma.outreachDraft.create({
      data: {
        prospectId: id,
        type: "AGENT",
        subject: `[${result.type.toUpperCase()}] ${result.subject}`,
        body: fullBody,
      },
    });

    return NextResponse.json(draft);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Agent outreach generation failed" }, { status: 500 });
  }
}
