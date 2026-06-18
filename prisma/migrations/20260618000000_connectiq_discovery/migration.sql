-- AlterTable: add new columns to Prospect
ALTER TABLE "Prospect"
  ADD COLUMN IF NOT EXISTS "revenueEstimate" TEXT,
  ADD COLUMN IF NOT EXISTS "keyDecisionMakers" TEXT,
  ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "connectiqScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "growthSignalsScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "technologyScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "revenuePotentialScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "companySizeFitScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "triggerEventsScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "aiAutomationScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "technologyNeed" TEXT,
  ADD COLUMN IF NOT EXISTS "priorityTier" TEXT,
  ADD COLUMN IF NOT EXISTS "estimatedPipelineValue" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceCompany" TEXT;

-- AlterEnum: add VALUE_INTRO to OutreachType
ALTER TYPE "OutreachType" ADD VALUE IF NOT EXISTS 'VALUE_INTRO';
