-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('NEW', 'RESEARCHING', 'RESEARCHED', 'SCORED', 'OUTREACH_READY', 'IN_CRM', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OpportunityRating" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('HIRING', 'EXPANSION', 'NEW_OFFICE', 'AWARD', 'LEADERSHIP_CHANGE', 'PRESS_RELEASE', 'NEW_PROJECT', 'PARTNERSHIP', 'FUNDING', 'OTHER');

-- CreateEnum
CREATE TYPE "OutreachType" AS ENUM ('EMAIL', 'LINKEDIN', 'CALL_SCRIPT', 'MEETING_BRIEF');

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "servicesOffered" TEXT[],
    "valueProposition" TEXT,
    "targetIndustries" TEXT[],
    "geography" TEXT[],
    "competitiveAdvantages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ICP" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industries" TEXT[],
    "geography" TEXT[],
    "minEmployees" INTEGER,
    "maxEmployees" INTEGER,
    "minYearsInBusiness" INTEGER,
    "keywords" TEXT[],
    "exclusions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ICP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "icpId" TEXT,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "employeeCount" INTEGER,
    "yearsInBusiness" INTEGER,
    "status" "ProspectStatus" NOT NULL DEFAULT 'NEW',
    "companySummary" TEXT,
    "services" TEXT[],
    "marketsServed" TEXT[],
    "locations" TEXT[],
    "leadershipInfo" TEXT,
    "fitScore" INTEGER,
    "fitReason" TEXT,
    "confidenceScore" INTEGER,
    "opportunityRating" "OpportunityRating",
    "recommendedConversation" TEXT,
    "hubspotCompanyId" TEXT,
    "hubspotContactId" TEXT,
    "source" TEXT,
    "researchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessSignal" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "type" "SignalType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachDraft" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "type" "OutreachType" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachDraft_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ICP" ADD CONSTRAINT "ICP_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_icpId_fkey" FOREIGN KEY ("icpId") REFERENCES "ICP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessSignal" ADD CONSTRAINT "BusinessSignal_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachDraft" ADD CONSTRAINT "OutreachDraft_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
