"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UrlScanForm } from "@/components/aiscanner/UrlScanForm";

export default function AIScannerScanPage() {
  const [initialUrl, setInitialUrl] = useState("");

  useEffect(() => {
    // The query string is only known on the client, so it's read after mount
    // (deferred to a microtask rather than set synchronously in the effect
    // body) and the form below is remounted via `key` once it's available.
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const url = new URLSearchParams(window.location.search).get("url");
      if (url) setInitialUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/aiscanner" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Scan Your Website</h1>
        <p className="mt-1 text-sm text-slate-400">
          Give AIScanner a bit more context and we&apos;ll tailor the AI opportunity report to your business.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <UrlScanForm key={initialUrl} variant="full" initialUrl={initialUrl} />
      </div>
    </div>
  );
}
