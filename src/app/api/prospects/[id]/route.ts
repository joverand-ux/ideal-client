import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prospect = await prisma.prospect.findUnique({ where: { id }, include: { businessSignals: true, outreachDrafts: true } });
  if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(prospect);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const prospect = await prisma.prospect.update({ where: { id }, data: body });
  return NextResponse.json(prospect);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.prospect.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
