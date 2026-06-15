import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Client } from "@hubspot/api-client";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });

  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "HubSpot API key not configured" }, { status: 400 });

  try {
    const hubspot = new Client({ accessToken: apiKey });

    const company = await hubspot.crm.companies.basicApi.create({
      properties: {
        name: prospect.companyName,
        domain: prospect.website?.replace(/^https?:\/\//, "").replace(/\/$/, "") ?? "",
        industry: prospect.industry ?? "",
        city: prospect.location ?? "",
      },
    });

    if (prospect.fitReason || prospect.recommendedConversation) {
      const noteBody = [
        prospect.fitReason ? `Fit Reason: ${prospect.fitReason}` : "",
        prospect.recommendedConversation ? `Recommended Approach: ${prospect.recommendedConversation}` : "",
      ].filter(Boolean).join("\n\n");

      // Add fit analysis as a company property note
      await hubspot.crm.companies.basicApi.update(company.id, {
        properties: { description: noteBody },
      });
    }

    await prisma.prospect.update({
      where: { id },
      data: { hubspotCompanyId: company.id, status: "IN_CRM" },
    });

    return NextResponse.json({ hubspotCompanyId: company.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "HubSpot sync failed" }, { status: 500 });
  }
}
