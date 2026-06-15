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
        <div className="flex h-screen bg-gray-950">
          <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
            <div className="p-6 border-b border-gray-700">
              <h1 className="text-xl font-bold text-white">ConnectIQ</h1>
              <p className="text-xs text-gray-400 mt-1">AI Relationship Intelligence</p>
            </div>
            <SidebarNav />
            <div className="p-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </aside>
          <main className="flex-1 overflow-auto bg-gray-950">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
