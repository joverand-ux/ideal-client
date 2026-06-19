import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const prospect = await prisma.prospect.findUnique({ where: { id }, include: { businessSignals: true, outreachDrafts: true } });
    if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(prospect);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch prospect" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;
    // Whitelist allowed fields to prevent accidental overwrites
    const allowed = ["website", "industry", "location", "employeeCount", "icpId", "linkedinUrl", "notes", "status"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) data[key] = body[key];
    }
    const prospect = await prisma.prospect.update({ where: { id }, data });
    return NextResponse.json(prospect);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update prospect" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.prospect.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete prospect" }, { status: 500 });
  }
}
