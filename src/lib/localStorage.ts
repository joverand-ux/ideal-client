import type { WebsiteAnalysis } from "./mockWebsiteAnalyzer";
import type { AIOpportunityReport } from "./reportGenerator";

// TODO(backend): Once AIScanner needs multi-user persistence, replace this
// localStorage-backed store with real API routes + the existing Prisma
// datastore (see prisma/schema.prisma) instead of client-side storage.

const STORAGE_KEY = "aiscanner_scans";

export interface InternalDetails {
  teamSize?: string;
  monthlyLeadVolume?: string;
  currentTools?: string;
  biggestBottleneck?: string;
  budgetRange?: string;
}

export type ScanStatus = "New" | "In Review" | "Sent to Client" | "Archived";

export interface ScanRequest {
  id: string;
  url: string;
  companyName?: string;
  industry?: string;
  competitors?: string;
  notes?: string;
  createdAt: string;
  internalDetails?: InternalDetails;
}

export interface StoredScan {
  id: string;
  request: ScanRequest;
  analysis?: WebsiteAnalysis;
  report?: AIOpportunityReport;
  status: ScanStatus;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): StoredScan[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(scans: StoredScan[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
}

export function getScans(): StoredScan[] {
  return readAll().sort((a, b) => new Date(b.request.createdAt).getTime() - new Date(a.request.createdAt).getTime());
}

export function getScanById(id: string): StoredScan | undefined {
  return readAll().find((s) => s.id === id);
}

export function createScanRequest(request: ScanRequest): StoredScan {
  const scan: StoredScan = { id: request.id, request, status: "New" };
  const scans = readAll();
  scans.push(scan);
  writeAll(scans);
  return scan;
}

export function saveScanResults(id: string, analysis: WebsiteAnalysis, report: AIOpportunityReport): StoredScan | undefined {
  const scans = readAll();
  const index = scans.findIndex((s) => s.id === id);
  if (index === -1) return undefined;
  scans[index] = { ...scans[index], analysis, report };
  writeAll(scans);
  return scans[index];
}

export function updateScanStatus(id: string, status: ScanStatus): void {
  const scans = readAll();
  const index = scans.findIndex((s) => s.id === id);
  if (index === -1) return;
  scans[index] = { ...scans[index], status };
  writeAll(scans);
}

export function updateInternalDetails(id: string, internalDetails: InternalDetails): StoredScan | undefined {
  const scans = readAll();
  const index = scans.findIndex((s) => s.id === id);
  if (index === -1) return undefined;
  scans[index] = { ...scans[index], request: { ...scans[index].request, internalDetails } };
  writeAll(scans);
  return scans[index];
}

export function deleteScan(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id));
}
