"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getScans, type StoredScan } from "@/lib/localStorage";
import { DashboardScanCard } from "@/components/aiscanner/DashboardScanCard";

export default function AIScannerDashboardPage() {
  const [scans, setScans] = useState<StoredScan[] | null>(null);

  useEffect(() => {
    // localStorage isn't available during SSR, so scans are always loaded
    // after mount. Deferred to a microtask (rather than set synchronously in
    // the effect body) to keep this a "fetch, then setState in a callback".
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setScans(getScans());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AIScanner Scans</h1>
          <p className="mt-1 text-sm text-slate-400">Every website scan run through AIScanner, stored locally.</p>
        </div>
        <Link
          href="/aiscanner"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
        >
          <Plus size={16} /> New Scan
        </Link>
      </div>

      {scans === null ? (
        <div className="py-20 text-center text-slate-500">Loading scans…</div>
      ) : scans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-20 text-center">
          <p className="text-lg font-medium text-white">No scans yet</p>
          <p className="mt-1 text-sm text-slate-400">Run your first AIScanner report to see it here.</p>
          <Link
            href="/aiscanner"
            className="mt-4 inline-block rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
          >
            Scan Your First Business
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scans.map((scan) => (
            <DashboardScanCard key={scan.id} scan={scan} />
          ))}
        </div>
      )}
    </div>
  );
}
