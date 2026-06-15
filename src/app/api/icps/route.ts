import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const icps = await prisma.iCP.findMany({ include: { clientProfile: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(icps);
}

export async function POST(req: Request) {
  const body = await req.json();
  const icp = await prisma.iCP.create({
    data: {
      clientProfileId: body.clientProfileId,
      name: body.name ?? "Unnamed ICP",
      industries: body.industries ?? [],
      geography: body.geography ?? [],
      minEmployees: body.minEmployees ? Number(body.minEmployees) : null,
      maxEmployees: body.maxEmployees ? Number(body.maxEmployees) : null,
      minYearsInBusiness: body.minYearsInBusiness ? Number(body.minYearsInBusiness) : null,
      keywords: body.keywords ?? [],
      exclusions: body.exclusions ?? [],
    },
  });
  return NextResponse.json(icp, { status: 201 });
}
