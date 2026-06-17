import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "@/components/sidebar-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ConnectIQ - AI Relationship Intelligence",
  description: "Turn Business Signals Into Qualified Conversations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-900">ConnectIQ</h1>
              <p className="text-xs text-gray-500 mt-1">AI Relationship Intelligence</p>
            </div>
            <SidebarNav />
            <div className="p-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">v1.0.0</p>
            </div>
          </aside>
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
