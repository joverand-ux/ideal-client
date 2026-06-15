import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const prospects = await prisma.prospect.findMany({
    include: { businessSignals: true, outreachDrafts: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(prospects);
}

export async function POST(req: Request) {
  const body = await req.json();
  const prospect = await prisma.prospect.create({
    data: {
      companyName: body.companyName,
      website: body.website ?? null,
      industry: body.industry ?? null,
      location: body.location ?? null,
      employeeCount: body.employeeCount ? Number(body.employeeCount) : null,
      icpId: body.icpId ?? null,
      source: "manual",
    },
  });
  return NextResponse.json(prospect, { status: 201 });
}
