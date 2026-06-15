import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ConnectIQ - AI Relationship Intelligence',
  description: 'AI-powered relationship intelligence platform',
}

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Client Profile', href: '/profile' },
  { label: 'Ideal Client Profiles', href: '/icps' },
  { label: 'Prospects', href: '/prospects' },
  { label: 'Settings', href: '/settings' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <aside className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <h1 className="text-xl font-bold text-white">ConnectIQ</h1>
              <p className="text-xs text-gray-400 mt-1">AI Relationship Intelligence</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-150 text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </aside>
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
