import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await prisma.clientProfile.findFirst();
  return NextResponse.json(profile);
}

export async function POST(req: Request) {
  const body = await req.json();
  const existing = await prisma.clientProfile.findFirst();
  const data = {
    companyName: body.companyName ?? "",
    website: body.website ?? null,
    servicesOffered: body.servicesOffered ?? [],
    valueProposition: body.valueProposition ?? null,
    targetIndustries: body.targetIndustries ?? [],
    geography: body.geography ?? [],
    competitiveAdvantages: body.competitiveAdvantages ?? [],
  };
  const profile = existing
    ? await prisma.clientProfile.update({ where: { id: existing.id }, data })
    : await prisma.clientProfile.create({ data });
  return NextResponse.json(profile);
}
