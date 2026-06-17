"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Target, Users, Settings } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Client Profile", href: "/profile", icon: Building2 },
  { label: "Ideal Client Profiles", href: "/icps", icon: Target },
  { label: "Prospects", href: "/prospects", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
            }`}>
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
