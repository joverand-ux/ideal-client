import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOutreach } from "@/lib/ai";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [prospect, clientProfile] = await Promise.all([
    prisma.prospect.findUnique({ where: { id }, include: { businessSignals: true } }),
    prisma.clientProfile.findFirst(),
  ]);

  if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  if (!clientProfile) return NextResponse.json({ error: "No client profile found" }, { status: 400 });

  const outreach = await generateOutreach(
    {
      companyName: prospect.companyName,
      companySummary: prospect.companySummary,
      fitReason: prospect.fitReason,
      recommendedConversation: prospect.recommendedConversation,
      technologyNeed: prospect.technologyNeed,
      likelyProblems: [],
      recommendedServices: [],
      estimatedPipelineValue: prospect.estimatedPipelineValue,
      services: prospect.services,
      priorityTier: prospect.priorityTier,
      businessSignals: prospect.businessSignals.map((s) => ({
        type: s.type,
        title: s.title,
        description: s.description ?? "",
      })),
    },
    clientProfile
  );

  await prisma.outreachDraft.deleteMany({ where: { prospectId: id } });

  await prisma.outreachDraft.createMany({
    data: [
      { prospectId: id, type: "EMAIL", subject: outreach.executiveEmail.subject, body: outreach.executiveEmail.body },
      { prospectId: id, type: "LINKEDIN", body: outreach.linkedin },
      { prospectId: id, type: "VALUE_INTRO", body: outreach.valueIntro },
      { prospectId: id, type: "CALL_SCRIPT", body: outreach.callScript },
      { prospectId: id, type: "MEETING_BRIEF", body: outreach.meetingBrief },
    ],
  });

  await prisma.prospect.update({ where: { id }, data: { status: "OUTREACH_READY" } });

  const drafts = await prisma.outreachDraft.findMany({ where: { prospectId: id } });
  return NextResponse.json(drafts);
}
