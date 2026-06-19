import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json() as { draftId?: string };
    const { draftId } = body;

    if (!draftId) {
      return NextResponse.json({ error: "draftId is required" }, { status: 400 });
    }

    const draft = await prisma.outreachDraft.findUnique({
      where: { id: draftId },
      include: { prospect: true },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (draft.prospectId !== id) {
      return NextResponse.json({ error: "Draft does not belong to this prospect" }, { status: 400 });
    }

    const clientProfile = await prisma.clientProfile.findFirst();
    if (!clientProfile) {
      return NextResponse.json({ error: "No client profile found" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const toEmail = process.env.PREVIEW_EMAIL ?? "joverand@gmail.com";
    const subject = draft.subject ?? `Outreach to ${draft.prospect.companyName}`;

    // For AGENT drafts, extract the message body only (strip reasoning section)
    let emailBody = draft.body;
    const messageMatch = draft.body.match(/\[MESSAGE\]\n([\s\S]*)/);
    if (messageMatch) {
      emailBody = messageMatch[1];
    }

    const { data, error } = await resend.emails.send({
      from: "outreach@resend.dev",
      to: toEmail,
      subject,
      text: emailBody,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await prisma.outreachDraft.update({
      where: { id: draftId },
      data: { sentAt: new Date(), approved: true },
    });

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err) {
    console.error("send-email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
