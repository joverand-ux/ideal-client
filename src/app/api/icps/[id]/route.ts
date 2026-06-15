import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const icp = await prisma.iCP.findUnique({ where: { id } });
  if (!icp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(icp);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const icp = await prisma.iCP.update({
    where: { id },
    data: {
      name: body.name,
      industries: body.industries ?? [],
      geography: body.geography ?? [],
      minEmployees: body.minEmployees ? Number(body.minEmployees) : null,
      maxEmployees: body.maxEmployees ? Number(body.maxEmployees) : null,
      minYearsInBusiness: body.minYearsInBusiness ? Number(body.minYearsInBusiness) : null,
      keywords: body.keywords ?? [],
      exclusions: body.exclusions ?? [],
    },
  });
  return NextResponse.json(icp);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.iCP.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
